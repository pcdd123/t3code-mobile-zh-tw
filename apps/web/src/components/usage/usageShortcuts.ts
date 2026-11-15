import type { KeybindingCommand, ResolvedKeybindingsConfig } from "@t3tools/contracts";
import type { useGT } from "gt-react";
import type { UsageChartMetric } from "./UsageProviderChart";
import { resolveShortcutCommand, type ShortcutEventLike } from "../../keybindings";

export type UsageMetric = UsageChartMetric | "limits";
export const METRIC_OPTIONS = [
  { value: "cost", label: "Cost", command: "usage.cost" },
  { value: "tokens", label: "Tokens", command: "usage.tokens" },
  { value: "limits", label: "Limits", command: "usage.limits" },
] as const satisfies readonly { value: UsageMetric; label: string; command: KeybindingCommand }[];

export const WINDOW_OPTIONS = [
  { days: 1, label: "Past 24h", command: "usage.period.day" },
  { days: 7, label: "7 days", command: "usage.period.week" },
  { days: 30, label: "30 days", command: "usage.period.month" },
  { days: 90, label: "90 days", command: "usage.period.quarter" },
] as const;

export function usageMetricLabel(metric: UsageMetric, gt: ReturnType<typeof useGT>): string {
  switch (metric) {
    case "cost":
      return gt("Cost");
    case "tokens":
      return gt("Tokens");
    case "limits":
      return gt("Limits");
  }
}

export function usageWindowLabel(
  days: (typeof WINDOW_OPTIONS)[number]["days"],
  gt: ReturnType<typeof useGT>,
): string {
  switch (days) {
    case 1:
      return gt("Past 24h");
    case 7:
      return gt("7 days");
    case 30:
      return gt("30 days");
    case 90:
      return gt("90 days");
  }
}

export function resolveUsageShortcut(
  event: ShortcutEventLike & { target: EventTarget | null },
  keybindings: ResolvedKeybindingsConfig,
) {
  const target = event.target;
  if (
    target instanceof HTMLElement &&
    (target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "SELECT" ||
      target.isContentEditable ||
      target.closest(
        '[role="dialog"]:not([data-app-modal]), [aria-modal="true"]:not([data-app-modal]), [data-slot$="popup"]:not([data-app-modal])',
      ))
  ) {
    return null;
  }

  return resolveShortcutCommand(event, keybindings, {
    context: { usagePageOpen: true },
  });
}
