import { englishGt, localized, type Translate } from "../components/Localized";
import {
  type AtomCommandResult,
  isAtomCommandInterrupted,
  squashAtomCommandFailure,
} from "@t3tools/client-runtime/state/runtime";
import { create } from "zustand";

import { stackedThreadToast, toastManager } from "../components/ui/toast";
import { shortcutLabelForCommand } from "../keybindings";
import { getTranslator } from "../i18n/currentTranslator";
import { announce, cancelAnnouncement } from "../lib/announce";
import { appAtomRegistry } from "../rpc/atomRegistry";
import { primaryServerKeybindingsAtom } from "../state/server";
import * as ThreadUndo from "@t3tools/client-runtime/state/thread-undo";

type UndoOptions = {
  action: "Settled" | "Snoozed" | "Unpinned" | "Archived" | "Discarded";
  undo: () => Promise<AtomCommandResult<unknown, unknown>>;
  failureTitle: string;
  claim: ReturnType<typeof ThreadUndo.begin>;
  commit?: () => void;
};

type UndoNotice = {
  action: UndoOptions["action"];
  count: number;
  undo: () => Promise<void>;
};

export const useThreadUndoNotice = create<{ notice: UndoNotice | null }>(() => ({ notice: null }));

function threadUndoNoticeSummary(
  { action, count }: Pick<UndoNotice, "action" | "count">,
  gt: Translate,
): string {
  const one = count === 1;
  switch (action) {
    case "Settled":
      return one ? gt("Settled 1 thread") : gt("Settled {count} threads", { count });
    case "Snoozed":
      return one ? gt("Snoozed 1 thread") : gt("Snoozed {count} threads", { count });
    case "Unpinned":
      return one ? gt("Unpinned 1 thread") : gt("Unpinned {count} threads", { count });
    case "Archived":
      return one ? gt("Archived 1 thread") : gt("Archived {count} threads", { count });
    case "Discarded":
      return one ? gt("Discarded 1 draft") : gt("Discarded {count} drafts", { count });
  }
}

function undoneSummary(action: UndoOptions["action"], count: number, gt: Translate): string {
  const one = count === 1;
  switch (action) {
    case "Settled":
      return one
        ? gt("Undid settle of 1 thread")
        : gt("Undid settle of {count} threads", { count });
    case "Snoozed":
      return one
        ? gt("Undid snooze of 1 thread")
        : gt("Undid snooze of {count} threads", { count });
    case "Unpinned":
      return one ? gt("Undid unpin of 1 thread") : gt("Undid unpin of {count} threads", { count });
    case "Archived":
      return one
        ? gt("Undid archive of 1 thread")
        : gt("Undid archive of {count} threads", { count });
    case "Discarded":
      return one
        ? gt("Undid discard of 1 draft")
        : gt("Undid discard of {count} drafts", { count });
  }
}

export function threadUndoLabel(
  keybindings: Parameters<typeof shortcutLabelForCommand>[0],
  gt: Translate = englishGt,
) {
  const shortcut = shortcutLabelForCommand(keybindings, "thread.undo");
  return shortcut ? gt("{shortcut} to undo", { shortcut }) : gt("Undo");
}

let announcedSummary: string | null = null;

// A live region that mounts already filled is skipped by screen readers, and settling
// usually moves focus to the next thread at the same moment, so the notice is announced
// separately from the alert that shows it.
function setNotice(notice: UndoNotice | null) {
  useThreadUndoNotice.setState({ notice });
  const gt = getTranslator();
  const summary = notice ? threadUndoNoticeSummary(notice, gt) : null;
  if (summary === announcedSummary) return;
  announcedSummary = summary;
  if (summary) {
    const label = threadUndoLabel(appAtomRegistry.get(primaryServerKeybindingsAtom), gt);
    announce(gt("{summary}, {label}", { summary, label }), "thread-undo-notice");
  } else {
    cancelAnnouncement("thread-undo-notice");
  }
}

let liveUndos: UndoOptions[] = [];
let expiry: ReturnType<typeof setTimeout> | undefined;
// A new notice owns mod+z even inside a text field, until the user presses
// another key or edits text. After that, mod+z is the field's own undo again.
let shortcutClaimed = false;

function refreshNotice() {
  const stale = liveUndos.filter(({ claim }) => !claim.isCurrent());
  liveUndos = liveUndos.filter((entry) => !stale.includes(entry));
  for (const entry of stale) entry.commit?.();
  const latest = liveUndos.at(-1);
  if (!latest) {
    clearTimeout(expiry);
    setNotice(null);
    return;
  }
  const group: UndoOptions[] = [];
  for (let index = liveUndos.length - 1; index >= 0; index--) {
    const entry = liveUndos[index]!;
    if (entry.action !== latest.action) break;
    group.push(entry);
  }
  setNotice({
    action: latest.action,
    count: group.length,
    undo: async () => {
      const current = group.filter((entry) => liveUndos.includes(entry) && entry.claim.isCurrent());
      liveUndos = liveUndos.filter((entry) => !group.includes(entry));
      // Claim before awaiting to prevent repeated actions restoring a group twice.
      for (const entry of current) entry.claim.finish();
      refreshNotice();
      let undone = 0;
      await Promise.all(
        current.map(async ({ undo, failureTitle }) => {
          const reportFailure = (error: unknown) => {
            toastManager.add(
              stackedThreadToast({
                type: "error",
                title: failureTitle,
                description:
                  error instanceof Error
                    ? error.message
                    : localized((gt) => gt("An error occurred.")),
              }),
            );
          };
          try {
            const result = await undo();
            if (result._tag === "Success") undone++;
            else if (!isAtomCommandInterrupted(result)) {
              reportFailure(squashAtomCommandFailure(result));
            }
          } catch (error) {
            reportFailure(error);
          }
        }),
      );
      // Failures already raise a toast, so only what was actually restored is spoken.
      if (undone > 0) {
        announce(undoneSummary(latest.action, undone, getTranslator()));
      }
    },
  });
}

ThreadUndo.subscribe(refreshNotice);

export function undoLatestThreadAction(): boolean {
  const notice = useThreadUndoNotice.getState().notice;
  if (!notice) return false;
  void notice.undo();
  return true;
}

/** Whether mod+z should undo the notice's actions even while a text field is focused. */
export function threadUndoClaimsShortcut(): boolean {
  return shortcutClaimed && useThreadUndoNotice.getState().notice !== null;
}

/** Called on any other keypress or text edit; hands mod+z back to text fields. */
export function releaseThreadUndoShortcut() {
  shortcutClaimed = false;
}

/** Shows one compact confirmation for the currently undoable thread actions. */
export function showThreadUndoNotice(options: UndoOptions) {
  if (!options.claim.isCurrent()) return;
  liveUndos.push(options);
  shortcutClaimed = true;
  refreshNotice();
  clearTimeout(expiry);
  expiry = setTimeout(() => {
    const expired = liveUndos;
    liveUndos = [];
    for (const { claim, commit } of expired) {
      claim.finish();
      commit?.();
    }
    refreshNotice();
  }, 5_000);
}
