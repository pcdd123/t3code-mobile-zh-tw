import { localized } from "../Localized";
import type { LinkedPrompt } from "@t3tools/shared/promptLinks";

import { type ComposerThreadTarget, useComposerDraftStore } from "~/composerDraftStore";

import { toastManager } from "../ui/toast";

export function warnAboutHiddenCharacters(prompt: LinkedPrompt): void {
  if (prompt.hiddenCharacters === 0) return;
  toastManager.add({
    type: "warning",
    title: localized((gt) => gt("This prompt had hidden characters, it may be malicious")),
    description: localized((gt) =>
      prompt.hiddenCharacters === 1
        ? gt("T3 Code removed 1 hidden character. Read the prompt before you send it.")
        : gt("T3 Code removed {count} hidden characters. Read the prompt before you send it.", {
            count: prompt.hiddenCharacters,
          }),
    ),
    timeout: 0,
  });
}

export function placeLinkedPrompt(
  target: ComposerThreadTarget,
  prompt: LinkedPrompt,
  notes: ReadonlyArray<string> = [],
): void {
  warnAboutHiddenCharacters(prompt);
  const place = () => {
    useComposerDraftStore.getState().setPrompt(target, prompt.text);
    toastManager.add({
      type: "info",
      title: localized((gt) => gt("Prompt added from a link")),
      description: localized((gt) => [gt("Read it before you send."), ...notes].join(" ")),
    });
  };
  const existing = useComposerDraftStore.getState().getComposerDraft(target)?.prompt ?? "";
  if (existing.trim().length === 0 || existing === prompt.text) {
    place();
    return;
  }
  const id = toastManager.add({
    type: "info",
    title: localized((gt) => gt("Linked prompt ready")),
    description: localized((gt) =>
      gt("This thread already has a draft. Replace it with the linked prompt?"),
    ),
    timeout: 0,
    actionProps: {
      children: localized((gt) => gt("Replace draft")),
      onClick: () => {
        toastManager.close(id);
        place();
      },
    },
  });
}
