import { MICROPHONE_PERMISSION_ERROR } from "@t3tools/client-runtime/voice-input";
import { useNavigate } from "@tanstack/react-router";
import { CircleAlertIcon, XIcon } from "lucide-react";

import { Button } from "../ui/button";
import { Tooltip, TooltipPopup, TooltipTrigger } from "../ui/tooltip";
import { VoiceInputPill } from "./VoiceInputPill";
import { useGT } from "gt-react";

function voiceErrorLabel(gt: ReturnType<typeof useGT>, error: string | null): string {
  switch (error) {
    case MICROPHONE_PERMISSION_ERROR:
      return gt("Mic blocked");
    case "Microphone access is required for voice input.":
      return gt("Mic blocked");
    case "This draft is no longer available.":
      return gt("Draft unavailable");
    case "Another voice recording is already active.":
      return gt("Already recording");
    case "Voice transcription is not available.":
      return gt("Voice input unavailable");
    case "Voice transcription is still finishing. Try again shortly.":
      return gt("Still transcribing");
    case "Voice transcription is not available for this language.":
      return gt("Language unsupported");
    case "Could not prepare voice transcription.":
      return gt("Couldn’t start");
    case "Could not start voice recording.":
      return gt("Couldn’t start");
    case "Voice recording was interrupted.":
      return gt("Recording interrupted");
    case "Could not finish voice recording.":
      return gt("Couldn’t finish");
    case "Could not transcribe this recording.":
      return gt("Transcription failed");
    case "Voice transcription on this environment failed.":
      return gt("Transcription failed");
    case "The draft changed while voice input was running. The transcript was not added.":
      return gt("Draft changed");
    case "No speech was detected.":
      return gt("No speech heard");
    case "Microphone processing failed.":
      return gt("Mic failed");
    case "The microphone disconnected.":
      return gt("Mic disconnected");
    default:
      return gt("Voice input failed");
  }
}

/** The controller reports English messages; this shows them translated. */
function voiceErrorMessage(gt: ReturnType<typeof useGT>, error: string): string {
  switch (error) {
    case MICROPHONE_PERMISSION_ERROR:
      return gt(
        "Microphone access is required for voice input. Allow access in your browser or system settings and try again.",
      );
    case "Microphone access is required for voice input.":
      return gt("Microphone access is required for voice input.");
    case "This draft is no longer available.":
      return gt("This draft is no longer available.");
    case "Another voice recording is already active.":
      return gt("Another voice recording is already active.");
    case "Voice transcription is not available.":
      return gt("Voice transcription is not available.");
    case "Voice transcription is still finishing. Try again shortly.":
      return gt("Voice transcription is still finishing. Try again shortly.");
    case "Voice transcription is not available for this language.":
      return gt("Voice transcription is not available for this language.");
    case "Could not prepare voice transcription.":
      return gt("Could not prepare voice transcription.");
    case "Could not start voice recording.":
      return gt("Could not start voice recording.");
    case "Voice recording was interrupted.":
      return gt("Voice recording was interrupted.");
    case "Could not finish voice recording.":
      return gt("Could not finish voice recording.");
    case "Could not transcribe this recording.":
      return gt("Could not transcribe this recording.");
    case "Voice transcription on this environment failed.":
      return gt("Voice transcription on this environment failed.");
    case "The draft changed while voice input was running. The transcript was not added.":
      return gt("The draft changed while voice input was running. The transcript was not added.");
    case "No speech was detected.":
      return gt("No speech was detected.");
    case "Microphone processing failed.":
      return gt("Microphone processing failed.");
    case "The microphone disconnected.":
      return gt("The microphone disconnected.");
    default:
      return error;
  }
}

const RETRYABLE_TRANSCRIPTIONS = new Set([
  "Could not transcribe this recording.",
  "Voice transcription on this environment failed.",
]);

export function VoiceInputErrorPill(props: {
  error: string | null;
  errorAction: "retry" | "settings" | null;
  disabled?: boolean;
  cancelShortcutLabel?: string | null;
  size?: "default" | "compact" | undefined;
  onRetry(): void;
  onDismiss(): void;
}) {
  const gt = useGT();
  const navigate = useNavigate();
  const message = props.error ? voiceErrorMessage(gt, props.error) : gt("Voice input failed");
  const openSettings = props.errorAction === "settings";
  const compact = props.size === "compact";
  const action = openSettings
    ? { label: gt("Open voice settings"), text: gt("Settings") }
    : props.error && RETRYABLE_TRANSCRIPTIONS.has(props.error)
      ? { label: gt("Retry transcription"), text: gt("Retry") }
      : { label: gt("Record again"), text: gt("Record again") };
  return (
    <VoiceInputPill tone="error" size={props.size}>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              size={compact ? "icon-xs" : "icon-sm-pill"}
              variant="ghost"
              aria-label={gt("Dismiss voice input error")}
              onPointerDown={(event) => event.preventDefault()}
              onClick={props.onDismiss}
              className="shrink-0"
            >
              <XIcon />
            </Button>
          }
        />
        <TooltipPopup side="top">
          {props.cancelShortcutLabel
            ? gt("Dismiss ({shortcut})", { shortcut: props.cancelShortcutLabel })
            : gt("Dismiss")}
        </TooltipPopup>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <span
              tabIndex={0}
              role="status"
              aria-label={message}
              className="flex min-w-0 items-center gap-1.5 rounded-sm text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
            />
          }
        >
          <CircleAlertIcon aria-hidden className="size-3.5 shrink-0" />
          <span className="truncate">{voiceErrorLabel(gt, props.error)}</span>
        </TooltipTrigger>
        <TooltipPopup side="top">{message}</TooltipPopup>
      </Tooltip>
      {props.errorAction ? (
        <Button
          type="button"
          size={compact ? "xs" : "sm-pill"}
          variant="outline"
          aria-label={action.label}
          disabled={props.disabled}
          onPointerDown={(event) => event.preventDefault()}
          onClick={() => {
            if (openSettings) {
              props.onDismiss();
              void navigate({ to: "/settings/voice" });
            } else {
              props.onRetry();
            }
          }}
          className="ms-auto shrink-0"
        >
          {action.text}
        </Button>
      ) : (
        <span aria-hidden className="w-1.5 shrink-0" />
      )}
    </VoiceInputPill>
  );
}
