import {
  collectLimitAccounts,
  collectLimitPools,
  type LimitAccount,
  type LimitPoolWindow,
  type LimitPresentations,
} from "@t3tools/shared/usageLimits";

import { getTranslator } from "../i18n/currentTranslator";
import type { WidgetTheme } from "./widgetTheme";

/**
 * The widget extension runs without the app's translator, so the app sends its words.
 * `{name}` placeholders are filled in the widget.
 */
export interface SubscriptionUsageLabels {
  openToRefresh: string;
  open: string;
  notAvailable: string;
  percentLeft: string;
  noSessionLimit: string;
  noWeeklyLimit: string;
  moreInApp: string;
  asOf: string;
  tapToConnect: string;
  noLimits: string;
  subscriptionRemaining: string;
  windowSummary: string;
  providerSummary: string;
}

function subscriptionUsageLabels(): SubscriptionUsageLabels {
  const gt = getTranslator();
  const keep = (...names: string[]) => Object.fromEntries(names.map((name) => [name, `{${name}}`]));
  return {
    openToRefresh: gt("Open T3 to refresh"),
    open: gt("Open T3"),
    notAvailable: gt("N/A"),
    percentLeft: gt("{percent}% left", keep("percent")),
    noSessionLimit: gt("No session limit reported"),
    noWeeklyLimit: gt("No weekly limit reported"),
    moreInApp: gt("{count} more in T3", keep("count")),
    asOf: gt("As of {time}", keep("time")),
    tapToConnect: gt("Tap to connect in T3"),
    noLimits: gt("No subscription limits available."),
    subscriptionRemaining: gt("Subscription remaining"),
    windowSummary: gt(
      "{provider}, {window}, {percent} percent remaining. {reset}. {detail}.",
      keep("provider", "window", "percent", "reset", "detail"),
    ),
    providerSummary: gt("{provider}. {detail}.", keep("provider", "detail")),
  };
}

export interface SubscriptionUsageSnapshot {
  theme?: WidgetTheme;
  url?: string;
  labels?: SubscriptionUsageLabels;
  checkedAt: number;
  providers: Array<{
    name: string;
    detail: string;
    windows: Array<{ kind?: string; label: string; remaining: number; reset: string }>;
    expiresAt: number;
    totalWindows: number;
  }>;
}

// Snapshots expire after 15 minutes; suspended refresh requires a separate authenticated transport.
const SNAPSHOT_MAX_AGE = 15 * 60_000;
export const WIDGET_REFRESH_INTERVAL = 5 * 60_000;

export function createWidgetRefresher<Id>(refresh: (id: Id) => Promise<unknown>) {
  const attempted = new Map<Id, number>();
  const pending = new Set<Id>();
  return async (connected: readonly Id[], now: number) => {
    await Promise.allSettled(
      connected.map(async (id) => {
        if (pending.has(id) || now - (attempted.get(id) ?? -Infinity) < WIDGET_REFRESH_INTERVAL)
          return;
        attempted.set(id, now);
        pending.add(id);
        try {
          await refresh(id);
        } finally {
          pending.delete(id);
        }
      }),
    );
  };
}

// A reset at or before its account's observation already happened, so it cannot expire the snapshot.
const isUpcoming = (reset: LimitPoolWindow["resets"][number]) =>
  reset.at > Date.parse(reset.member.account.limits.checkedAt);

function resetText(at: number, upcoming: boolean): string {
  const gt = getTranslator();
  const time = new Date(at).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return upcoming ? gt("Next reset {time}", { time }) : gt("Reset {time}", { time });
}

function subscriptionUsageProps(
  accounts: readonly LimitAccount[],
  now: number,
  configuredDrivers: ReadonlySet<string>,
  maxWindowsPerProvider: number,
): SubscriptionUsageSnapshot {
  const gt = getTranslator();
  const pools = collectLimitPools(accounts, now);
  const checked = accounts
    .filter((account) => account.driver === "codex" || account.driver === "claudeAgent")
    .map((account) => Date.parse(account.limits.checkedAt));
  return {
    checkedAt: checked.length > 0 && checked.every(Number.isFinite) ? Math.min(...checked) : 0,
    providers: (["codex", "claudeAgent"] as const)
      .filter(
        (driver) =>
          configuredDrivers.has(driver) || accounts.some((account) => account.driver === driver),
      )
      .map((driver) => {
        const pool = pools.find((candidate) => candidate.driver === driver);
        const name = driver === "codex" ? "Codex" : "Claude";
        if (!pool)
          return {
            name,
            detail: gt("No limits available"),
            windows: [],
            expiresAt: 0,
            totalWindows: 0,
          };
        const checkedAt = Math.min(...pool.accounts.map((a) => Date.parse(a.limits.checkedAt)));
        const expiresAt = Math.min(
          checkedAt + SNAPSHOT_MAX_AGE,
          ...pool.windows.flatMap((window) =>
            window.resets.filter(isUpcoming).map((reset) => reset.at),
          ),
        );
        const fresh = Number.isFinite(expiresAt) && expiresAt > now;
        const sortedWindows = [...pool.windows].sort(
          (a, b) => a.remainingPercent - b.remainingPercent,
        );
        const selectedWindows = [
          ...new Set([
            sortedWindows.find((window) => window.kind === "session"),
            sortedWindows.find((window) => window.kind === "weekly"),
            ...sortedWindows,
          ]),
        ]
          .filter((window) => window !== undefined)
          .slice(0, maxWindowsPerProvider)
          .sort((a, b) => a.remainingPercent - b.remainingPercent);
        return {
          name,
          detail: !fresh
            ? gt("Open T3 to refresh")
            : pool.accounts.length > 1
              ? gt("{count} accounts · pooled", { count: pool.accounts.length })
              : gt("Subscription remaining"),
          expiresAt: fresh ? expiresAt : 0,
          totalWindows: fresh ? pool.windows.length : 0,
          windows: fresh
            ? selectedWindows.map((window) => ({
                kind: window.kind,
                label: window.label,
                remaining: Math.round(window.remainingPercent),
                reset: window.resets[0]
                  ? resetText(window.resets[0].at, isUpcoming(window.resets[0]))
                  : gt("Reset time unavailable"),
              }))
            : [],
        };
      }),
  };
}

export function buildSubscriptionUsageSnapshot(
  presentations: LimitPresentations,
  url: string,
  maxWindowsPerProvider = 6,
): SubscriptionUsageSnapshot {
  const configuredDrivers = new Set(
    [...presentations.values()].flatMap((presentation) =>
      (presentation.serverConfig?.providers ?? [])
        // Servers report default-enabled drivers even when their CLI is missing.
        .filter(
          (provider) =>
            provider.enabled &&
            provider.installed &&
            provider.usageLimits?.unavailable?.reason !== "unsupported",
        )
        .map((provider) => provider.driver),
    ),
  );
  return {
    ...subscriptionUsageProps(
      collectLimitAccounts(presentations),
      0,
      configuredDrivers,
      maxWindowsPerProvider,
    ),
    url,
    labels: subscriptionUsageLabels(),
  };
}

export function subscriptionUsageTimeline(snapshot: SubscriptionUsageSnapshot, now: number) {
  const deadlines = [...new Set(snapshot.providers.map((p) => p.expiresAt))]
    .filter((deadline) => deadline > now)
    .sort((a, b) => a - b);
  return [now, ...deadlines].map((date) => ({
    date: new Date(date),
    props: {
      ...snapshot,
      providers: snapshot.providers.map((provider) =>
        provider.windows.length > 0 && provider.expiresAt <= date
          ? {
              ...provider,
              detail: snapshot.labels?.openToRefresh ?? "Open T3 to refresh",
              windows: [],
              totalWindows: 0,
            }
          : provider,
      ),
    },
  }));
}
