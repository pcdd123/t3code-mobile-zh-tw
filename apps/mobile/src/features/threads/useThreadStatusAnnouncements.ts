import { useIsFocused } from "@react-navigation/native";
import {
  nextThreadAnnouncement,
  THREAD_STATUS_TEXT,
  type ThreadAnnouncementMemory,
} from "@t3tools/client-runtime/state/thread-activity-announcement";
import { useEffect, useRef } from "react";
import { AccessibilityInfo } from "react-native";

import { getTranslator, type Translate } from "../../i18n/currentTranslator";
import { useAppActive } from "../../lib/appState";
import {
  nextThreadActivitySnapshot,
  type ThreadActivityInput,
  type ThreadActivityMemory,
} from "./threadStatusAnnouncement";

function localizeThreadStatusText(text: string, gt: Translate): string {
  switch (text) {
    case THREAD_STATUS_TEXT.working:
      return gt("Working");
    case THREAD_STATUS_TEXT.approval:
      return gt("Needs approval");
    case THREAD_STATUS_TEXT.input:
      return gt("Needs your input");
    case THREAD_STATUS_TEXT.done:
      return gt("Done");
    case THREAD_STATUS_TEXT.failed:
      return gt("Failed");
    case THREAD_STATUS_TEXT.stopped:
      return gt("Stopped");
    default:
      return text;
  }
}

/** Tells VoiceOver and TalkBack when the open thread starts working, needs the user, or finishes. */
export function useThreadStatusAnnouncements({
  threadKey,
  subject,
  detailBehind,
  approvalRequestId,
  userInputRequestId,
  shellRequestId,
  shellPendingUserInput,
  working,
  run,
}: ThreadActivityInput & {
  /** Null when nothing should be announced, such as a provider subagent's thread. */
  readonly threadKey: string | null;
  /** The thread's title, said after each status when another thread is on screen beside it. */
  readonly subject: string | null;
  /** See isDetailBehindShell. */
  readonly detailBehind: boolean;
}) {
  // A retained route stays mounted under the screen above it; it speaks only while shown,
  // and starts from a silent baseline when it is shown again.
  const focused = useIsFocused();
  const appActive = useAppActive();
  const activeKey = focused && appActive ? threadKey : null;
  const memoryRef = useRef<{
    threadKey: string;
    activity: ThreadActivityMemory;
    announcement: ThreadAnnouncementMemory;
  } | null>(null);
  const runId = run?.runId ?? null;
  const runStatus = run?.status ?? null;

  // oxlint-disable-next-line t3code/no-unreasoned-state-sync -- speaks committed status changes through the platform screen reader
  useEffect(() => {
    if (activeKey === null) {
      memoryRef.current = null;
      return;
    }
    if (detailBehind) return;
    const previous = memoryRef.current?.threadKey === activeKey ? memoryRef.current : null;
    const activity = nextThreadActivitySnapshot(previous?.activity ?? null, {
      approvalRequestId,
      userInputRequestId,
      shellRequestId,
      shellPendingUserInput,
      working,
      run: runId === null || runStatus === null ? null : { runId, status: runStatus },
    });
    const next = nextThreadAnnouncement(previous?.announcement ?? null, activity.snapshot);
    memoryRef.current = { threadKey: activeKey, activity, announcement: next.memory };
    // Queued, like the web's polite region, so VoiceOver doesn't cut off what it is reading.
    if (next.announcement !== null) {
      // Read when spoken, so the effect does not rerun when the language changes.
      const gt = getTranslator();
      const status = localizeThreadStatusText(next.announcement, gt);
      AccessibilityInfo.announceForAccessibilityWithOptions(
        subject === null ? status : gt("{status}: {title}", { status, title: subject }),
        { queue: true },
      );
    }
  }, [
    activeKey,
    subject,
    detailBehind,
    approvalRequestId,
    userInputRequestId,
    shellRequestId,
    shellPendingUserInput,
    working,
    runId,
    runStatus,
  ]);
}
