import type { VoiceInputState } from "@t3tools/client-runtime/voice-input";
import type { useGT } from "gt-react-native";

import { localizeExternalMessage } from "../../i18n/externalMessages";

export type VoiceComposerPresentation = {
  readonly leadingAction: "cancel" | null;
  readonly trailingAction: "mic" | "confirm";
  readonly showsSend: boolean;
  readonly statusKind: "active" | "error" | null;
  readonly statusLabel: string | null;
  readonly confirmationEnabled: boolean;
};

/** Translates the English status labels below and the voice controller's errors. */
export function localizeVoiceStatusLabel(
  presentation: VoiceComposerPresentation,
  gt: ReturnType<typeof useGT>,
): string | null {
  const label = presentation.statusLabel;
  if (label === null) return label;
  if (presentation.statusKind === "error") return localizeExternalMessage(label, gt);
  if (label === "Preparing") return gt("Preparing");
  if (label === "Transcribing") return gt("Transcribing");
  if (label.startsWith("Recording ")) {
    return gt("Recording {time}", { time: label.slice("Recording ".length) });
  }
  return label;
}

export function resolveVoiceComposerPresentation(
  state: VoiceInputState,
  elapsedSeconds: number,
): VoiceComposerPresentation {
  switch (state.phase) {
    case "idle":
      return {
        leadingAction: null,
        trailingAction: "mic",
        showsSend: true,
        statusKind: null,
        statusLabel: null,
        confirmationEnabled: false,
      };
    case "error":
      return {
        leadingAction: null,
        trailingAction: "mic",
        showsSend: true,
        statusKind: "error",
        statusLabel: state.error,
        confirmationEnabled: false,
      };
    case "preparing":
      return {
        leadingAction: "cancel",
        trailingAction: "confirm",
        showsSend: false,
        statusKind: "active",
        statusLabel: "Preparing",
        confirmationEnabled: false,
      };
    case "recording": {
      const seconds = Math.max(0, Math.floor(elapsedSeconds));
      return {
        leadingAction: "cancel",
        trailingAction: "confirm",
        showsSend: false,
        statusKind: "active",
        statusLabel: `Recording ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`,
        confirmationEnabled: true,
      };
    }
    case "transcribing":
    case "post-processing":
      return {
        leadingAction: "cancel",
        trailingAction: "confirm",
        showsSend: false,
        statusKind: "active",
        statusLabel: "Transcribing",
        confirmationEnabled: false,
      };
  }
}
