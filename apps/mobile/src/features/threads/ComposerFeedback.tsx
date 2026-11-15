import { Button } from "../../components/ui/Button";
import {
  codexFeedbackNotice,
  type CodexFeedbackSubmission,
} from "@t3tools/client-runtime/state/threads";
import { Pressable, View } from "react-native";
import { useGT } from "gt-react-native";

import { AppText as Text } from "../../components/ui/AppText";
import { SymbolView } from "../../components/ui/AppSymbol";
import { copyTextWithHaptic } from "../../lib/copyTextWithHaptic";

export function ComposerFeedback({
  submission,
  onDismiss,
}: {
  readonly submission: CodexFeedbackSubmission;
  readonly onDismiss: () => void;
}) {
  const gt = useGT();
  const notice = codexFeedbackNotice(submission);
  if (!notice) return null;
  const title =
    submission.status === "uploading"
      ? gt("Sending feedback to OpenAI...")
      : submission.status === "sent"
        ? gt("Feedback sent to OpenAI")
        : submission.status === "failed"
          ? gt("Could not send feedback to OpenAI")
          : notice.title;
  const description =
    submission.status === "sent"
      ? gt("Thread ID: {id}", { id: submission.feedbackId })
      : notice.description;
  return (
    <View className="px-4 pb-3">
      <View className="gap-2 rounded-[20px] border-continuous bg-card p-4">
        <View className="flex-row items-center gap-3">
          <Text accessibilityLiveRegion="polite" className="min-w-0 flex-1 text-sm text-foreground">
            {title}
          </Text>
          {submission.status !== "uploading" ? (
            <Pressable
              accessibilityLabel={gt("Dismiss feedback notice")}
              accessibilityRole="button"
              hitSlop={12}
              onPress={onDismiss}
              className="p-1 active:opacity-60"
            >
              <SymbolView
                name="xmark"
                size={14}
                tintColorClassName="accent-icon-muted"
                type="monochrome"
              />
            </Pressable>
          ) : null}
        </View>
        {description ? (
          <Text selectable className="text-xs text-foreground-muted">
            {description}
          </Text>
        ) : null}
        {submission.status === "sent" ? (
          <Button
            label={gt("Copy ID")}

            tone="text"
            onPress={() =>
              copyTextWithHaptic(submission.feedbackId, { target: "Codex feedback thread ID" })
            }
          />
        ) : null}
      </View>
    </View>
  );
}
