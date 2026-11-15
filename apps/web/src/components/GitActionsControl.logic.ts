import type {
  GitRunStackedActionResult,
  GitStackedAction,
  ReviewDiffPreviewSource,
  VcsStatusResult,
} from "@t3tools/contracts";
import { isTemporaryWorktreeBranch } from "@t3tools/shared/git";
import type { ChangeRequestTerminology } from "@t3tools/client-runtime/source-control-clients";
import {
  changeRequestTerminologyFor,
  type DefaultBranchActionDialogCopy,
  type DefaultBranchConfirmableAction,
  type GitActionIconName,
  type GitDialogAction,
} from "@t3tools/client-runtime/state/vcs";

import { englishGt, type Translate } from "./Localized";

/** The change-request noun inside a translated sentence, e.g. "pull request". */
export function changeRequestNoun(terminology: ChangeRequestTerminology, gt: Translate): string {
  switch (terminology.singular) {
    case "pull request":
      return gt("pull request");
    case "merge request":
      return gt("merge request");
    case "change request":
      return gt("change request");
    default:
      return terminology.singular;
  }
}

export {
  requiresDefaultBranchConfirmation,
  type DefaultBranchConfirmableAction,
  type GitActionIconName,
} from "@t3tools/client-runtime/state/vcs";

export interface GitActionMenuItem {
  id: "commit" | "push" | "pr";
  label: string;
  disabled: boolean;
  icon: GitActionIconName;
  kind: "open_dialog";
  dialogAction?: GitDialogAction;
}

export interface GitQuickAction {
  label: string;
  disabled: boolean;
  kind: "run_action" | "run_pull" | "open_publish" | "show_hint";
  action?: GitStackedAction;
  hint?: string;
}

export interface GitActionProgressPresentation {
  readonly status: string;
  readonly output: string | null;
  readonly startedAtMs: number | null;
}

export interface GitActionResultToastTiming {
  readonly timeout: 0;
  readonly dismissAfterVisibleMs: number | null;
}

export const GIT_ACTION_SUCCESS_VISIBLE_MS = 10_000;

export function resolveGitActionResultToastTiming(
  type: "error" | "success",
): GitActionResultToastTiming {
  return {
    timeout: 0,
    dismissAfterVisibleMs: type === "success" ? GIT_ACTION_SUCCESS_VISIBLE_MS : null,
  };
}

export function resolveGitActionProgressPresentation(
  input: {
    readonly isRunning: boolean;
    readonly operation: string | null;
    readonly currentLabel: string | null;
    readonly lastOutputLine: string | null;
    readonly phaseStartedAtMs: number | null;
    readonly hookStartedAtMs: number | null;
  },
  gt: Translate = englishGt,
): GitActionProgressPresentation | null {
  if (
    !input.isRunning ||
    (input.operation !== "run_change_request" && input.operation !== "pull")
  ) {
    return null;
  }

  const currentLabel = input.currentLabel?.trim();
  const output = input.lastOutputLine?.trim();
  const isPull = input.operation === "pull";
  return {
    status:
      currentLabel && currentLabel !== "Running source control action"
        ? sourceControlActionLabel(currentLabel, gt)
        : isPull
          ? gt("Pulling latest changes...")
          : gt("Starting source control action..."),
    output: !isPull && output ? output : null,
    startedAtMs: isPull
      ? input.phaseStartedAtMs
      : (input.hookStartedAtMs ?? input.phaseStartedAtMs),
  };
}

/** Progress labels from `state/sourceControlActions` stay English ids; known ones translate here. */
function sourceControlActionLabel(label: string, gt: Translate): string {
  switch (label) {
    case "Initializing repository":
      return gt("Initializing repository");
    case "Pulling latest changes...":
      return gt("Pulling latest changes...");
    case "Publishing repository":
      return gt("Publishing repository");
    case "Preparing pull request thread":
      return gt("Preparing pull request thread");
    default:
      return label;
  }
}

export function formatGitActionElapsed(startedAtMs: number | null, nowMs: number): string | null {
  if (startedAtMs === null) {
    return null;
  }

  const elapsedSeconds = Math.max(0, Math.floor((nowMs - startedAtMs) / 1_000));
  if (elapsedSeconds < 60) {
    return `${elapsedSeconds}s`;
  }

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

export function buildMenuItems(
  gitStatus: VcsStatusResult | null,
  isBusy: boolean,
  hasPrimaryRemote = true,
  gt: Translate = englishGt,
): GitActionMenuItem[] {
  if (!gitStatus) return [];
  const terminology = changeRequestTerminologyFor(gitStatus);

  const hasBranch = gitStatus.refName !== null;
  const hasChanges = gitStatus.hasWorkingTreeChanges;
  const hasOpenPr = gitStatus.pr?.state === "open";
  const isBehind = gitStatus.behindCount > 0;
  const hasDefaultBranchDelta = (gitStatus.aheadOfDefaultCount ?? gitStatus.aheadCount) > 0;
  const canPushWithoutUpstream = hasPrimaryRemote && !gitStatus.hasUpstream;
  const canCommit = !isBusy && hasChanges;
  const canPush =
    !isBusy &&
    hasBranch &&
    !isBehind &&
    gitStatus.aheadCount > 0 &&
    (gitStatus.hasUpstream || canPushWithoutUpstream);
  const canCreatePr =
    !isBusy &&
    hasBranch &&
    !hasOpenPr &&
    hasDefaultBranchDelta &&
    !isBehind &&
    (gitStatus.hasUpstream || canPushWithoutUpstream);

  const commitItem: GitActionMenuItem = {
    id: "commit",
    label: gt("Commit"),
    disabled: !canCommit,
    icon: "commit",
    kind: "open_dialog",
    dialogAction: "commit",
  };

  if (!hasPrimaryRemote) {
    return [commitItem];
  }

  const pushItem: GitActionMenuItem = {
    id: "push",
    label: gt("Push"),
    disabled: !canPush,
    icon: "push",
    kind: "open_dialog",
    dialogAction: "push",
  };

  if (hasOpenPr) {
    return [commitItem, pushItem];
  }

  return [
    commitItem,
    pushItem,
    {
      id: "pr",
      label: gt("Create {changeRequest}", { changeRequest: terminology.shortLabel }),
      disabled: !canCreatePr,
      icon: "pr",
      kind: "open_dialog",
      dialogAction: "create_pr",
    },
  ];
}

export function getMenuActionDisabledReason({
  item,
  gitStatus,
  isBusy,
  hasPrimaryRemote,
  gt = englishGt,
}: {
  item: GitActionMenuItem;
  gitStatus: VcsStatusResult | null;
  isBusy: boolean;
  hasPrimaryRemote: boolean;
  gt?: Translate;
}): string | null {
  if (!item.disabled) return null;
  if (isBusy) return gt("Git action in progress.");
  if (!gitStatus) return gt("Git status is unavailable.");

  const hasBranch = gitStatus.refName !== null;
  const hasChanges = gitStatus.hasWorkingTreeChanges;
  const isAhead = gitStatus.aheadCount > 0;
  const isBehind = gitStatus.behindCount > 0;
  const terminology = changeRequestTerminologyFor(gitStatus);

  if (item.id === "commit") {
    if (!hasChanges) {
      return gt("Worktree is clean. Make changes before committing.");
    }
    return gt("Commit is currently unavailable.");
  }

  if (item.id === "push") {
    if (!hasBranch) {
      return gt("Detached HEAD: check out a branch before pushing.");
    }
    if (isBehind) {
      return gt("Branch is behind upstream. Pull/rebase before pushing.");
    }
    if (!gitStatus.hasUpstream && !hasPrimaryRemote) {
      return gt('Add an "origin" remote before pushing.');
    }
    if (!isAhead) {
      return gt("No local commits to push.");
    }
    return gt("Push is currently unavailable.");
  }

  const noun = changeRequestNoun(terminology, gt);
  if (!hasBranch) {
    return gt("Detached HEAD: check out a branch before creating a {changeRequest}.", {
      changeRequest: noun,
    });
  }
  if (!gitStatus.hasUpstream && !hasPrimaryRemote) {
    return gt('Add an "origin" remote before creating a {changeRequest}.', {
      changeRequest: noun,
    });
  }
  if ((gitStatus.aheadOfDefaultCount ?? gitStatus.aheadCount) <= 0) {
    return gt("No local commits to include in a {changeRequest}.", { changeRequest: noun });
  }
  if (isBehind) {
    return gt("Branch is behind upstream. Pull/rebase before creating a {changeRequest}.", {
      changeRequest: noun,
    });
  }
  return gt("Create {changeRequest} is currently unavailable.", { changeRequest: noun });
}

export function hasUsableGitMenuContent(input: {
  readonly menuItems: readonly GitActionMenuItem[];
  readonly canWriteSourceControl: boolean;
  readonly canPublishRepository: boolean;
  readonly hasNotice: boolean;
}): boolean {
  return (
    input.canPublishRepository ||
    input.hasNotice ||
    (input.canWriteSourceControl && input.menuItems.some((item) => !item.disabled))
  );
}

export function resolveQuickAction(
  gitStatus: VcsStatusResult | null,
  isBusy: boolean,
  isDefaultRef = false,
  hasPrimaryRemote = true,
  gt: Translate = englishGt,
): GitQuickAction {
  if (isBusy) {
    return {
      label: gt("Commit"),
      disabled: true,
      kind: "show_hint",
      hint: gt("Git action in progress."),
    };
  }

  if (!gitStatus) {
    return {
      label: gt("Commit"),
      disabled: true,
      kind: "show_hint",
      hint: gt("Git status is unavailable."),
    };
  }

  const hasBranch = gitStatus.refName !== null;
  const hasChanges = gitStatus.hasWorkingTreeChanges;
  const hasOpenPr = gitStatus.pr?.state === "open";
  const isAhead = gitStatus.aheadCount > 0;
  const hasDefaultBranchDelta = (gitStatus.aheadOfDefaultCount ?? gitStatus.aheadCount) > 0;
  const isBehind = gitStatus.behindCount > 0;
  const isDiverged = isAhead && isBehind;
  const terminology = changeRequestTerminologyFor(gitStatus);

  if (!hasBranch) {
    return {
      label: gt("Commit"),
      disabled: true,
      kind: "show_hint",
      hint: gt("Create and checkout a ref before pushing or opening a {changeRequest}.", {
        changeRequest: changeRequestNoun(terminology, gt),
      }),
    };
  }

  if (hasChanges) {
    if (isBehind || (!gitStatus.hasUpstream && !hasPrimaryRemote)) {
      return { label: gt("Commit"), disabled: false, kind: "run_action", action: "commit" };
    }
    if (hasOpenPr || isDefaultRef) {
      return {
        label: gt("Commit & push"),
        disabled: false,
        kind: "run_action",
        action: "commit_push",
      };
    }
    return {
      label: gt("Commit, push & {changeRequest}", { changeRequest: terminology.shortLabel }),
      disabled: false,
      kind: "run_action",
      action: "commit_push_pr",
    };
  }

  if (!gitStatus.hasUpstream) {
    if (!hasPrimaryRemote) {
      return {
        label: gt("Publish repository"),
        disabled: false,
        kind: "open_publish",
      };
    }
    if (!isAhead) {
      if (hasOpenPr) {
        return {
          label: gt("Commit"),
          disabled: true,
          kind: "show_hint",
          hint: gt("Branch is up to date. No action needed."),
        };
      }
      return {
        label: gt("Push"),
        disabled: true,
        kind: "show_hint",
        hint: gt("No local commits to push."),
      };
    }
    if (hasOpenPr || isDefaultRef) {
      return {
        label: gt("Push"),
        disabled: false,
        kind: "run_action",
        action: isDefaultRef ? "commit_push" : "push",
      };
    }
    return {
      label: gt("Push & create {changeRequest}", { changeRequest: terminology.shortLabel }),
      disabled: false,
      kind: "run_action",
      action: "create_pr",
    };
  }

  if (isDiverged) {
    return {
      label: gt("Sync ref"),
      disabled: true,
      kind: "show_hint",
      hint: gt("Branch has diverged from upstream. Rebase/merge first."),
    };
  }

  if (isBehind) {
    return {
      label: gt("Pull"),
      disabled: false,
      kind: "run_pull",
    };
  }

  if (isAhead) {
    if (hasOpenPr || isDefaultRef) {
      return {
        label: gt("Push"),
        disabled: false,
        kind: "run_action",
        action: isDefaultRef ? "commit_push" : "push",
      };
    }
    return {
      label: gt("Push & create {changeRequest}", { changeRequest: terminology.shortLabel }),
      disabled: false,
      kind: "run_action",
      action: "create_pr",
    };
  }

  if (hasOpenPr && gitStatus.hasUpstream) {
    return {
      label: gt("Commit"),
      disabled: true,
      kind: "show_hint",
      hint: gt("Branch is up to date. No action needed."),
    };
  }

  if (hasDefaultBranchDelta && !isDefaultRef) {
    return {
      label: gt("Create {changeRequest}", { changeRequest: terminology.shortLabel }),
      disabled: false,
      kind: "run_action",
      action: "create_pr",
    };
  }

  return {
    label: gt("Commit"),
    disabled: true,
    kind: "show_hint",
    hint: gt("Branch is up to date. No action needed."),
  };
}

export function resolveDefaultBranchActionDialogCopy(input: {
  action: DefaultBranchConfirmableAction;
  branchName: string;
  includesCommit: boolean;
  terminology: ChangeRequestTerminology;
  gt?: Translate;
}): DefaultBranchActionDialogCopy {
  const branch = input.branchName;
  const { terminology, gt = englishGt } = input;
  const shortLabel = terminology.shortLabel;
  const changeRequest = changeRequestNoun(terminology, gt);

  if (input.action === "push" || input.action === "commit_push") {
    if (input.includesCommit) {
      return {
        title: gt("Commit & push to default ref?"),
        description: gt(
          'This action will commit and push changes on "{branch}". You can continue on this ref or create a feature ref and run the same action there.',
          { branch },
        ),
        continueLabel: gt("Commit & push to {branch}", { branch }),
      };
    }
    return {
      title: gt("Push to default ref?"),
      description: gt(
        'This action will push local commits on "{branch}". You can continue on this ref or create a feature ref and run the same action there.',
        { branch },
      ),
      continueLabel: gt("Push to {branch}", { branch }),
    };
  }

  if (input.includesCommit) {
    return {
      title: gt("Commit, push & create {shortLabel} from default ref?", { shortLabel }),
      description: gt(
        'This action will commit, push, and create a {changeRequest} on "{branch}". You can continue on this ref or create a feature ref and run the same action there.',
        { changeRequest, branch },
      ),
      continueLabel: gt("Commit, push & create {shortLabel}", { shortLabel }),
    };
  }
  return {
    title: gt("Push & create {shortLabel} from default ref?", { shortLabel }),
    description: gt(
      'This action will push local commits and create a {changeRequest} on "{branch}". You can continue on this ref or create a feature ref and run the same action there.',
      { changeRequest, branch },
    ),
    continueLabel: gt("Push & create {shortLabel}", { shortLabel }),
  };
}

/** The server names a feature branch from the commit it makes, so the action must commit changes. */
export function resolveFeatureBranchUnavailableReason(input: {
  action: DefaultBranchConfirmableAction;
  branchName: string;
  hasWorkingTreeChanges: boolean;
  gt?: Translate;
}): string | null {
  const { gt = englishGt } = input;
  if (!input.hasWorkingTreeChanges) {
    return gt(
      "There are no changes to commit, so a feature branch can't be named. Create a branch yourself or continue on {branch}.",
      { branch: input.branchName },
    );
  }
  if (input.action === "push" || input.action === "create_pr") {
    return gt(
      "This action doesn't commit your changes, so a feature branch can't be named. Create a branch yourself or continue on {branch}.",
      { branch: input.branchName },
    );
  }
  return null;
}

export function resolveThreadBranchUpdate(
  result: GitRunStackedActionResult,
): { branch: string } | null {
  if (result.branch.status !== "created" || !result.branch.name) {
    return null;
  }

  return {
    branch: result.branch.name,
  };
}

export function resolveThreadBranchMetadataPatch(
  branch: string | null,
  expectedBranch: string | null,
): {
  branch: string | null;
  expectedBranch: string | null;
} {
  return { branch, expectedBranch };
}

export function resolveLiveThreadBranchUpdate(input: {
  threadBranch: string | null;
  gitStatus: VcsStatusResult | null;
}): { branch: string | null } | null {
  if (!input.gitStatus) {
    return null;
  }

  if (input.gitStatus.refName === null && input.threadBranch !== null) {
    return null;
  }

  if (input.threadBranch === input.gitStatus.refName) {
    return null;
  }

  if (
    input.threadBranch !== null &&
    input.gitStatus.refName !== null &&
    !isTemporaryWorktreeBranch(input.threadBranch) &&
    isTemporaryWorktreeBranch(input.gitStatus.refName)
  ) {
    return null;
  }

  return {
    branch: input.gitStatus.refName,
  };
}

export type ChangesLineTotals = {
  readonly insertions: number;
  readonly deletions: number;
  /** Ref the counts compare against; `null` means they are uncommitted changes against HEAD. */
  readonly baseRef: string | null;
};

// `branchChanges ?? workingTree` treats `{0,0}` as present, so a zero branch total hid a dirty
// working tree and the Changes row read +0 while Diff still showed the work.
// The Diff panel's branch comparison wins when it has file stats, so a remembered base or
// hidden whitespace reads the same in the row as in the panel.
export function resolveChangesTotals(
  status: VcsStatusResult | null | undefined,
  branchPreview?: ReviewDiffPreviewSource | null,
): ChangesLineTotals | null {
  if (branchPreview?.files) {
    let insertions = 0;
    let deletions = 0;
    for (const file of branchPreview.files) {
      insertions += file.additions;
      deletions += file.deletions;
    }
    return { insertions, deletions, baseRef: branchPreview.baseRef };
  }
  if (!status) return null;
  const branch = status.branchChanges;
  const tree = { ...status.workingTree, baseRef: null };
  const selected =
    branch && (branch.insertions > 0 || branch.deletions > 0)
      ? branch
      : tree.insertions > 0 || tree.deletions > 0
        ? tree
        : (branch ?? tree);
  return {
    insertions: selected.insertions,
    deletions: selected.deletions,
    baseRef: selected.baseRef,
  };
}
