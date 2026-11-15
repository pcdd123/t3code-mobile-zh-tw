import type { OrchestrationV2UserMessageInputIntent } from "@t3tools/contracts";
import type { useGT } from "gt-react-native";

export interface UserMessageIntentBadgePresentation {
  readonly label: string;
  readonly accessibilityLabel: string;
}

export function resolveUserMessageIntentBadge(
  intent: OrchestrationV2UserMessageInputIntent | undefined,
  gt: ReturnType<typeof useGT>,
  unread = false,
): UserMessageIntentBadgePresentation | null {
  if (unread && (intent === "steer" || intent === "promoted_queued_to_steer")) {
    return {
      label: gt("Steer · waiting to be read"),
      accessibilityLabel: gt(
        "Steer waiting for the agent to read it after the running command finishes",
      ),
    };
  }
  switch (intent) {
    case "steer":
      return {
        label: gt("Steer"),
        accessibilityLabel: gt("Steered the active turn"),
      };
    case "promoted_queued_to_steer":
      return {
        label: gt("Steer"),
        accessibilityLabel: gt("Originally queued, then promoted to steer the active turn"),
      };
    case "queued_turn":
    case "turn_start":
    case undefined:
      return null;
  }
}
