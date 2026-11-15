import type { ThreadTitleRegenerationOutcome } from "@t3tools/contracts";
import {
  type AtomCommandResult,
  isAtomCommandInterrupted,
  squashAtomCommandFailure,
} from "@t3tools/client-runtime/state/runtime";
import type { useGT } from "gt-react";

import { stackedThreadToast } from "./ui/toast";

type TitleRegenerationResult = AtomCommandResult<ThreadTitleRegenerationOutcome | null, unknown>;
type Translate = ReturnType<typeof useGT>;

function failureMessage(result: TitleRegenerationResult, gt: Translate): string | null {
  if (result._tag === "Failure") {
    if (isAtomCommandInterrupted(result)) return null;
    const error = squashAtomCommandFailure(result);
    return error instanceof Error ? error.message : gt("An error occurred.");
  }
  return result.value?.status === "failed"
    ? (result.value.message ?? gt("Title generation failed."))
    : null;
}

function isKept(result: TitleRegenerationResult): boolean {
  return result._tag === "Success" && result.value?.status === "unchanged";
}

export function titleRegenerationToast(
  results: ReadonlyArray<TitleRegenerationResult>,
  gt: Translate,
) {
  const failures = results.flatMap((result) => {
    const message = failureMessage(result, gt);
    return message === null ? [] : [message];
  });
  if (failures.length > 0) {
    return stackedThreadToast({
      type: "error",
      title:
        results.length === 1
          ? gt("Failed to regenerate thread title")
          : gt("Failed to regenerate {failed} of {total} thread titles", {
              failed: failures.length,
              total: results.length,
            }),
      description: failures[0],
    });
  }
  const kept = results.filter(isKept).length;
  if (kept === 0) return null;
  if (results.length === 1) {
    return stackedThreadToast({
      type: "info",
      title: gt("Title kept"),
      description: gt("The current title already fits this thread."),
    });
  }
  return stackedThreadToast({
    type: "info",
    title:
      kept === results.length
        ? gt("Titles kept")
        : gt("Kept {kept} of {total} titles", { kept, total: results.length }),
    description:
      kept === results.length
        ? gt("The current titles already fit these threads.")
        : gt("Those titles already fit their threads."),
  });
}
