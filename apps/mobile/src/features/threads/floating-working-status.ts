import type { EnvironmentConnectionPhase } from "@t3tools/client-runtime/connection";
import type { EnvironmentId } from "@t3tools/contracts";
import type { useGT } from "gt-react-native";

export interface FloatingStatusAction {
  readonly label: string;
  readonly accessibilityLabel: string;
  readonly disabled: boolean;
  readonly onPress: () => void;
}

export type FloatingWorkingStatus =
  | { readonly kind: "working"; readonly environmentId: EnvironmentId; readonly startedAt: string }
  | { readonly kind: "syncing"; readonly label: string }
  | { readonly kind: "compacting" }
  | {
      readonly kind: "child-input";
      readonly label: string;
      readonly accessibilityLabel: string;
      readonly onPress: () => void;
    }
  | {
      readonly kind: "background";
      readonly label: string;
      readonly accessibilityLabel: string;
      readonly waiting: boolean;
      readonly onPress: () => void;
      readonly action: FloatingStatusAction;
    }
  | {
      readonly kind: "lifecycle";
      readonly state: "snoozed" | "settled" | "woke";
      readonly label: string;
      readonly action: FloatingStatusAction;
    }
  | {
      readonly kind: "stop";
      readonly label: string;
      readonly unresponsive: boolean;
      readonly action: FloatingStatusAction | null;
    }
  | { readonly kind: "goal"; readonly label: string; readonly accessibilityLabel: string }
  | { readonly kind: "extension"; readonly label: string; readonly onPress: () => void }
  | { readonly kind: "preparing"; readonly label: string }
  | {
      readonly kind: "connection";
      readonly tone: "reconnecting" | "unavailable";
      readonly label: string;
      readonly onPress: () => void;
    };

export function connectionFloatingStatus(input: {
  readonly connectionError: string | null;
  readonly connectionState: EnvironmentConnectionPhase;
  readonly connectionAwaitingApproval?: boolean;
  readonly environmentLabel: string | null;
  readonly onReconnect: () => void;
  readonly gt: ReturnType<typeof useGT>;
}): FloatingWorkingStatus | null {
  const { gt } = input;
  const environmentLabel = input.environmentLabel ?? gt("Environment");
  const unavailable = (label: string): FloatingWorkingStatus => ({
    kind: "connection",
    tone: "unavailable",
    label,
    onPress: input.onReconnect,
  });

  if (input.connectionState === "reconnecting" && input.connectionAwaitingApproval) {
    return {
      kind: "connection",
      tone: "reconnecting",
      label: gt("Waiting for {environment} to approve this device", {
        environment: environmentLabel,
      }),
      onPress: input.onReconnect,
    };
  }
  switch (input.connectionState) {
    case "connecting":
    case "reconnecting":
      return {
        kind: "connection",
        tone: "reconnecting",
        label:
          input.connectionError === null
            ? gt("Reconnecting to {environment}...", { environment: environmentLabel })
            : gt("Failed to connect. Retrying {environment}...", {
                environment: environmentLabel,
              }),
        onPress: input.onReconnect,
      };
    case "offline":
      return unavailable(gt("You are offline"));
    case "unsupported":
      return unavailable(gt("Client not supported"));
    case "error":
      return unavailable(
        input.connectionError
          ? gt("Failed to connect to {environment}: {error}", {
              environment: environmentLabel,
              error: input.connectionError,
            })
          : gt("Failed to connect to {environment}", { environment: environmentLabel }),
      );
    case "available":
      return unavailable(gt("{environment} is not connected", { environment: environmentLabel }));

    case "connected":
      return null;
  }
}
