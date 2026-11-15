import type { ThreadReferenceCopyTarget } from "@t3tools/client-runtime/thread-reference";
import {
  COMPOSER_CONTEXT_CLIPBOARD_MIME,
  encodeComposerContextFragment,
} from "@t3tools/shared/composerContextClipboard";

import { localized } from "../components/Localized";
import { stackedThreadToast, toastManager } from "../components/ui/toast";
import { writeTextToClipboard } from "../hooks/useCopyToClipboard";

export async function copyThreadReference(target: ThreadReferenceCopyTarget): Promise<void> {
  const fragment = target.fragment ? encodeComposerContextFragment(target.fragment) : null;
  try {
    await writeTextToClipboard(
      target.value,
      target.clipboardTarget,
      fragment ? { [COMPOSER_CONTEXT_CLIPBOARD_MIME]: fragment } : undefined,
    );
  } catch (error) {
    console.error(error);
    toastManager.add(
      stackedThreadToast({
        type: "error",
        title: localized((gt) =>
          target.kind === "pull-request"
            ? gt("Failed to copy PR link")
            : gt("Failed to copy thread"),
        ),
        description:
          error instanceof Error ? error.message : localized((gt) => gt("An error occurred.")),
      }),
    );
  }
}
