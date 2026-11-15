import { type EnvironmentConnectionPhase } from "@t3tools/client-runtime/connection";
import type { useGT } from "gt-react-native";

export type ThreadContentPresentation =
  | { readonly kind: "ready" }
  | { readonly kind: "loading" }
  | {
      readonly kind: "unavailable";
      readonly title: string;
      readonly detail: string;
    };

export function projectThreadContentPresentation(input: {
  readonly hasDetail: boolean;
  readonly detailError: string | null;
  readonly detailDeleted: boolean;
  readonly connectionState: EnvironmentConnectionPhase;
}): ThreadContentPresentation {
  if (input.hasDetail) {
    return { kind: "ready" };
  }
  if (input.detailDeleted) {
    return {
      kind: "unavailable",
      title: "Thread unavailable",
      detail: "This thread was deleted or is no longer available.",
    };
  }
  if (input.detailError !== null) {
    return {
      kind: "unavailable",
      title: "Could not load conversation",
      detail: input.detailError,
    };
  }
  if (
    input.connectionState === "connected" ||
    input.connectionState === "connecting" ||
    input.connectionState === "reconnecting"
  ) {
    return { kind: "loading" };
  }
  return {
    kind: "unavailable",
    title: "Messages not cached",
    detail: "Reconnect this environment to load the conversation.",
  };
}

/** The localized title and detail of an unavailable presentation; the projection keeps English. */
export function localizedThreadContentUnavailable(
  presentation: Extract<ThreadContentPresentation, { readonly kind: "unavailable" }>,
  gt: ReturnType<typeof useGT>,
): { readonly title: string; readonly detail: string } {
  switch (presentation.title) {
    case "Thread unavailable":
      return {
        title: gt("Thread unavailable"),
        detail: gt("This thread was deleted or is no longer available."),
      };
    case "Could not load conversation":
      return { title: gt("Could not load conversation"), detail: presentation.detail };
    case "Messages not cached":
      return {
        title: gt("Messages not cached"),
        detail: gt("Reconnect this environment to load the conversation."),
      };
    default:
      return presentation;
  }
}
