import * as Dialog from "../../components/ui/Dialog";
import { buildNewThreadLink, type LinkedPrompt } from "@t3tools/shared/promptLinks";

import { getTranslator } from "../../i18n/currentTranslator";
import { tryCopyTextWithHaptic } from "../../lib/copyTextWithHaptic";
import {
  getComposerDraftSnapshot,
  setComposerDraftText,
  waitForComposerDraftsLoaded,
} from "../../state/use-composer-drafts";
import { linkedThreadDraftAction, localizePromptLinkError } from "./prompt-link-model";

export function showDraftsUnavailable(): void {
  const gt = getTranslator();
  Dialog.alert(
    gt("Could not open link"),
    gt("Drafts could not be loaded, so the prompt was not added."),
  );
}

/** Shows a prompt link that could not be read, in the UI language. */
export function showInvalidPromptLink(error: string): void {
  const gt = getTranslator();
  Dialog.alert(gt("Could not open link"), localizePromptLinkError(error, gt));
}

export function showPromptLinkNotice(notice: string): void {
  Dialog.alert(getTranslator()("Prompt from a link"), notice);
}

export async function applyLinkedPromptToThreadDraft(
  draftKey: string,
  prompt: LinkedPrompt,
  notice: string,
): Promise<void> {
  try {
    await waitForComposerDraftsLoaded();
  } catch {
    showDraftsUnavailable();
    return;
  }
  const action = linkedThreadDraftAction(getComposerDraftSnapshot(draftKey).text, prompt.text);
  if (action !== "ask") {
    if (action === "fill") setComposerDraftText(draftKey, prompt.text);
    showPromptLinkNotice(notice);
    return;
  }
  const gt = getTranslator();
  Dialog.alert(gt("Linked prompt ready. Replace draft?"), notice, [
    { text: gt("Keep mine"), style: "cancel" },
    { text: gt("Replace"), onPress: () => setComposerDraftText(draftKey, prompt.text) },
  ]);
}

export async function copyPromptLink(prompt: string): Promise<void> {
  if (!(await tryCopyTextWithHaptic(buildNewThreadLink({ prompt }), { target: "prompt link" }))) {
    const gt = getTranslator();
    Dialog.alert(gt("Could not copy"), gt("Try again."));
  }
}
