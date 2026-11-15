import type { RelayAgentActivityAggregateState } from "@t3tools/contracts/relay";

import { getTranslator } from "../i18n/currentTranslator";
import type { AgentActivityProps } from "./AgentActivity";

// The widget only refreshes while the app is open, so after this long it stops
// claiming an agent is still working. Matches the Live Activity's stale date.
export const AGENT_ACTIVITY_WIDGET_STALE_AFTER_MS = 10 * 60_000;

export type AgentActivityWidgetSource =
  | { readonly kind: "signed-out" }
  | { readonly kind: "unavailable" }
  | { readonly kind: "loading" }
  | { readonly kind: "snapshot"; readonly aggregate: RelayAgentActivityAggregateState | null };

/** The widget extension runs without the app's translator, so the app sends its words. */
export interface AgentActivityWidgetLabels {
  readonly needsYouOne: string;
  /** Has a `{count}` placeholder, as do the other plural labels. */
  readonly needsYouMany: string;
  readonly needsAttentionOne: string;
  readonly needsAttentionMany: string;
  readonly active: string;
  readonly outOfDate: string;
  readonly failed: string;
  readonly done: string;
  readonly noActiveAgents: string;
}

export type AgentActivityWidgetProps = AgentActivityProps & {
  readonly labels?: AgentActivityWidgetLabels;
};

function agentActivityWidgetLabels(): AgentActivityWidgetLabels {
  const gt = getTranslator();
  return {
    needsYouOne: gt("1 needs you"),
    needsYouMany: gt("{count} need you", { count: "{count}" }),
    needsAttentionOne: gt("1 needs attention"),
    needsAttentionMany: gt("{count} need attention", { count: "{count}" }),
    active: gt("{count} active", { count: "{count}" }),
    outOfDate: gt("Out of date"),
    failed: gt("Failed"),
    done: gt("Done"),
    noActiveAgents: gt("No active agents"),
  };
}

export function agentActivityWidgetTimeline(source: AgentActivityWidgetSource, now: number) {
  const updatedAt = new Date(now).toISOString();
  const labels = agentActivityWidgetLabels();
  if (source.kind !== "snapshot" || !source.aggregate) {
    const gt = getTranslator();
    const props: AgentActivityWidgetProps = {
      title: "T3 Code",
      subtitle:
        source.kind === "signed-out"
          ? gt("Sign in to T3 Connect to see agents")
          : source.kind === "unavailable"
            ? gt("Couldn't reach T3 Connect")
            : source.kind === "loading"
              ? gt("Loading agents…")
              : labels.noActiveAgents,
      activeCount: 0,
      updatedAt,
      activities: [],
      labels,
    };
    return [{ date: new Date(now), props }];
  }

  const { aggregate } = source;
  const props: AgentActivityWidgetProps = {
    title: aggregate.title,
    subtitle: aggregate.subtitle,
    activeCount: aggregate.activeCount,
    updatedAt: aggregate.updatedAt,
    activities: aggregate.activities,
    labels,
  };
  const hasInFlightRows = props.activities.some(
    (row) => row.phase !== "completed" && row.phase !== "failed",
  );
  if (!hasInFlightRows) {
    return [{ date: new Date(now), props }];
  }
  const staleProps: AgentActivityWidgetProps = {
    ...props,
    activities: props.activities.map((row) =>
      row.phase === "completed" || row.phase === "failed"
        ? row
        : { ...row, phase: "stale", status: labels.outOfDate },
    ),
  };
  return [
    { date: new Date(now), props },
    { date: new Date(now + AGENT_ACTIVITY_WIDGET_STALE_AFTER_MS), props: staleProps },
  ];
}
