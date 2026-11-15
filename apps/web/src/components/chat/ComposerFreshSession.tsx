import { EraserIcon } from "lucide-react";

import type { ComposerBannerStackItem } from "./ComposerBannerStack";
import { useGT } from "gt-react";

function FreshSessionText({ part }: { readonly part: "title" | "description" }) {
  const gt = useGT();
  return part === "title"
    ? gt("Your next message starts a fresh session")
    : gt("The agent won't see earlier messages in this thread.");
}

/** Shown while `/clear` is armed; dismissing it keeps the current conversation. */
export function freshSessionBannerItem(
  onUndo: () => void,
  gt: ReturnType<typeof useGT>,
): ComposerBannerStackItem {
  return {
    id: "fresh-session",
    variant: "info",
    icon: <EraserIcon />,
    title: <FreshSessionText part="title" />,
    description: <FreshSessionText part="description" />,
    dismissLabel: gt("Keep the current session"),
    onDismiss: onUndo,
  };
}
