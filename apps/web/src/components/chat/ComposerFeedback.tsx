import {
  codexFeedbackNotice,
  type CodexFeedbackSubmission,
} from "@t3tools/client-runtime/state/threads";
import { MessageSquareIcon } from "lucide-react";

import { writeTextToClipboard } from "../../hooks/useCopyToClipboard";
import { Button } from "../ui/button";
import { toastManager } from "../ui/toast";
import type { ComposerBannerStackItem } from "./ComposerBannerStack";
import { useGT } from "gt-react";

function CopyFeedbackIdButton({ feedbackId }: { feedbackId: string }) {
  const gt = useGT();
  return (
    <Button
      size="xs"
      variant="ghost"
      onClick={() => {
        void writeTextToClipboard(feedbackId, "Codex feedback thread ID").catch(
          (error: unknown) => {
            toastManager.add({
              type: "error",
              title: gt("Could not copy thread ID"),
              description: error instanceof Error ? error.message : gt("An error occurred."),
            });
          },
        );
      }}
    >
      {gt("Copy ID")}
    </Button>
  );
}

export function feedbackBannerItem(
  submission: CodexFeedbackSubmission,
  onDismiss: () => void,
  gt: ReturnType<typeof useGT>,
): ComposerBannerStackItem | null {
  const notice = codexFeedbackNotice(submission);
  if (!notice) return null;
  return {
    id: `feedback:${submission.id}`,
    variant:
      submission.status === "failed" ? "error" : submission.status === "sent" ? "success" : "info",
    icon: <MessageSquareIcon />,
    ...notice,
    actions:
      submission.status === "sent" ? (
        <CopyFeedbackIdButton feedbackId={submission.feedbackId} />
      ) : undefined,
    ...(submission.status !== "uploading"
      ? { dismissLabel: gt("Dismiss feedback notice"), onDismiss }
      : {}),
  };
}
