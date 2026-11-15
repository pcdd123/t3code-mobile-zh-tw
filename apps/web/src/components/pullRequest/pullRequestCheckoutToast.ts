import type { ChangeRequestTerminology } from "@t3tools/client-runtime/source-control-clients";
import type { useGT } from "gt-react";

export function offHeadPullRequestCheckoutToast(
  terminology: ChangeRequestTerminology,
  gt: ReturnType<typeof useGT>,
) {
  return {
    type: "warning",
    title: gt("Checked out, but not confirmed on the latest commit"),
    description: gt(
      "This checkout could not be confirmed at the {term}'s latest commit, so its code may differ. Local commits or uncommitted work keep a checkout where it is.",
      { term: terminology.singular },
    ),
  } as const;
}
