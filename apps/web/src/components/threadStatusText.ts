import { THREAD_STATUS_TEXT } from "@t3tools/client-runtime/state/thread-activity-announcement";

import type { Translate } from "./Localized";

/** The shared announcer's English status words, in the UI language. */
export function localizeThreadStatusText(text: string, gt: Translate): string {
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
