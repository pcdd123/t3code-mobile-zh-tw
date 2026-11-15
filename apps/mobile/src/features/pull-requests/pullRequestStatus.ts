import type {
  PullRequestActivity,
  PullRequestCheck,
  PullRequestChecksState,
  PullRequestDetail,
  PullRequestListEntry,
  PullRequestMergeability,
} from "@t3tools/contracts";
import type { useGT } from "gt-react-native";
import type { AppSymbolName } from "../../components/ui/AppSymbol";
import { PullRequestGlyph } from "./pullRequestGlyphs";

const STATES = {
  open: {
    label: "Open",
    icon: PullRequestGlyph.pullRequest,
    tint: "accent-adaptive-emerald-600-400",
    text: "text-adaptive-emerald-600-400",
    background: "bg-adaptive-emerald-500-a12-a16",
  },
  merged: {
    label: "Merged",
    icon: PullRequestGlyph.merged,
    tint: "accent-adaptive-violet-600-400",
    text: "text-adaptive-violet-600-400",
    background: "bg-adaptive-violet-500-a12-a16",
  },
  closed: {
    label: "Closed",
    icon: PullRequestGlyph.closed,
    tint: "accent-danger-foreground",
    text: "text-danger-foreground",
    background: "bg-danger",
  },
  draft: {
    label: "Draft",
    icon: PullRequestGlyph.draft,
    tint: "accent-icon-muted",
    text: "text-foreground-muted",
    background: "bg-grouped-card",
  },
} satisfies Record<
  string,
  { label: string; icon: AppSymbolName; tint: string; text: string; background: string }
>;

type Translate = ReturnType<typeof useGT>;

export function pullRequestStatus(pr: Pick<PullRequestListEntry, "state" | "isDraft">) {
  return STATES[pr.isDraft && pr.state === "open" ? "draft" : pr.state];
}

/** The localized form of `pullRequestStatus(pr).label`. */
export function pullRequestStatusLabel(
  pr: Pick<PullRequestListEntry, "state" | "isDraft">,
  gt: Translate,
): string {
  if (pr.isDraft && pr.state === "open") return gt("Draft");
  switch (pr.state) {
    case "open":
      return gt("Open");
    case "merged":
      return gt("Merged");
    case "closed":
      return gt("Closed");
  }
}

export function pullRequestConflict(pr: {
  readonly state: PullRequestListEntry["state"];
  readonly isDraft: boolean;
  readonly mergeability?: PullRequestMergeability | undefined;
  readonly baseBranch?: string | undefined;
}) {
  if (pr.state !== "open" || pr.isDraft || pr.mergeability !== "conflicting") return null;
  return { label: pr.baseBranch ? `Conflicts with ${pr.baseBranch}` : "Has conflicts" };
}

/** The localized form of `pullRequestConflict(pr)?.label`. */
export function pullRequestConflictLabel(
  pr: Parameters<typeof pullRequestConflict>[0],
  gt: Translate,
): string | null {
  if (pullRequestConflict(pr) === null) return null;
  return pr.baseBranch
    ? gt("Conflicts with {branch}", { branch: pr.baseBranch })
    : gt("Has conflicts");
}

export function checkStatus(check: PullRequestCheck, gt: Translate) {
  switch (check.status) {
    case "success":
      return {
        label: gt("Passed"),
        icon: "checkmark.circle",
        tint: "accent-adaptive-emerald-600-400",
      } as const;
    case "failure":
      return {
        label: gt("Failed"),
        icon: "exclamationmark.circle",
        tint: "accent-danger-foreground",
      } as const;
    case "action-required":
      return {
        label: gt("Action required"),
        icon: "exclamationmark.circle",
        tint: "accent-warning-foreground",
      } as const;
    case "pending":
      return { label: gt("Pending"), icon: "clock", tint: "accent-warning-foreground" } as const;
    case "cancelled":
      return { label: gt("Cancelled"), icon: "minus", tint: "accent-icon-muted" } as const;
    case "skipped":
      return { label: gt("Skipped"), icon: "slash.circle", tint: "accent-icon-muted" } as const;
    case "neutral":
      return { label: gt("Neutral"), icon: "minus", tint: "accent-icon-muted" } as const;
  }
}

export function isFailingCheck(check: PullRequestCheck) {
  return check.status === "failure" || check.status === "cancelled";
}

export function pullRequestChecksSummary(pr: Pick<PullRequestDetail, "checks">, gt: Translate) {
  const failed = pr.checks.filter(isFailingCheck).length;
  const required = pr.checks.filter((check) => check.status === "action-required").length;
  const pending = pr.checks.filter((check) => check.status === "pending").length;
  const passed = pr.checks.filter((check) => check.status === "success").length;
  const total = pr.checks.length;
  const count = total ? gt("{passed} of {total}", { passed, total }) : undefined;
  if (failed) {
    const failing =
      failed === 1 ? gt("1 check failing") : gt("{count} checks failing", { count: failed });
    return {
      label: failing,
      title: failing,
      count,
      icon: "exclamationmark.circle",
      tint: "accent-danger-foreground",
    } as const;
  }
  if (required)
    return {
      label: gt("{count} need attention", { count: required }),
      title: gt("Checks need attention"),
      count: gt("{count} awaiting action", { count: required }),
      icon: "exclamationmark.circle",
      tint: "accent-warning-foreground",
    } as const;
  if (pending)
    return {
      label: gt("{count} pending", { count: pending }),
      title: gt("Checks running"),
      count: gt("{count} pending", { count: pending }),
      icon: "clock",
      tint: "accent-warning-foreground",
    } as const;
  if (passed)
    return {
      label: gt("{passed} of {total} passed", { passed, total }),
      title: passed === total ? gt("All checks passed") : gt("Checks completed"),
      count,
      icon: "checkmark.circle",
      tint: "accent-adaptive-emerald-600-400",
    } as const;
  return {
    label: total ? gt("{count} completed", { count: total }) : gt("No checks reported"),
    title: total ? gt("Checks completed") : gt("No checks reported"),
    count,
    icon: "minus",
    tint: "accent-icon-muted",
  } as const;
}

// GitHub and Forgejo send uppercase review states; Bitbucket and GitCafe send lowercase.
export function normalizedReviewState(reviewState: string | null) {
  return reviewState?.toUpperCase().replaceAll("-", "_");
}

export function pullRequestReviewSummary(
  pr: Pick<PullRequestDetail, "reviewers">,
  activity: Pick<PullRequestActivity, "comments" | "commits"> | null,
  gt: Translate,
) {
  const latest = new Map<string, PullRequestActivity["comments"][number]>();
  const comments = new Map<string, PullRequestActivity["comments"][number]>();
  for (const review of activity?.comments ?? []) {
    const state = normalizedReviewState(review.reviewState);
    if (review.kind !== "review" || !state) continue;
    const key = review.author?.login ?? review.id;
    if (state === "COMMENTED") {
      const previous = comments.get(key);
      if (!previous || Date.parse(review.createdAt) >= Date.parse(previous.createdAt))
        comments.set(key, { ...review, reviewState: state });
      continue;
    }
    if (!["APPROVED", "CHANGES_REQUESTED", "DISMISSED"].includes(state)) continue;
    const previous = latest.get(key);
    if (!previous || Date.parse(review.createdAt) >= Date.parse(previous.createdAt))
      latest.set(key, { ...review, reviewState: state });
  }
  const reviews = [
    ...[...latest.values()].filter((review) => review.reviewState !== "DISMISSED"),
    ...[...comments.entries()].filter(([key]) => !latest.has(key)).map(([, review]) => review),
  ];
  const requested = reviews.filter((review) => review.reviewState === "CHANGES_REQUESTED");
  const newestCommit = Math.max(
    0,
    ...(activity?.commits.map((commit) => Date.parse(commit.committedDate)) ?? []),
  );
  const approved = reviews.filter(
    (review) => review.reviewState === "APPROVED" && Date.parse(review.createdAt) >= newestCommit,
  );
  if (requested.length)
    return {
      title: gt("Changes requested"),
      count:
        requested.length === 1
          ? gt("1 reviewer")
          : gt("{count} reviewers", { count: requested.length }),
      icon: "xmark.circle.fill",
      tint: "accent-danger-foreground",
      reviews,
    } as const;
  if (approved.length)
    return {
      title:
        approved.length === 1 && approved[0]?.author
          ? gt("Approved by {login}", { login: approved[0].author.login })
          : gt("Reviews approved"),
      count: gt("{count} approved", { count: approved.length }),
      icon: "checkmark.circle",
      tint: "accent-adaptive-emerald-600-400",
      reviews,
    } as const;
  const commented = reviews.filter((review) => review.reviewState === "COMMENTED");
  if (commented.length && !pr.reviewers.length)
    return {
      title: gt("Reviews"),
      count: gt("{count} commented", { count: commented.length }),
      icon: "bubble.left",
      tint: "accent-icon-muted",
      reviews,
    } as const;
  return {
    title: pr.reviewers.length ? gt("Awaiting review") : gt("Request a review"),
    count: pr.reviewers.length
      ? gt("{count} requested", { count: pr.reviewers.length })
      : gt("None assigned"),
    icon: "person.2",
    tint: "accent-icon-muted",
    reviews,
  } as const;
}

export function pullRequestBranchSummary(
  pr: Pick<PullRequestDetail, "mergeability" | "baseComparison" | "behindBy" | "baseBranch">,
  gt: Translate,
) {
  if (pr.mergeability === "conflicting") return gt("Has conflicts");
  if (pr.baseComparison === "behind") {
    return pr.behindBy == null
      ? gt("behind {branch}", { branch: pr.baseBranch })
      : gt("{count} behind {branch}", { count: pr.behindBy, branch: pr.baseBranch });
  }
  if (pr.baseComparison === "up-to-date") return gt("Up to date");
  return pr.mergeability === "mergeable" ? gt("No conflicts") : gt("Not reported");
}

export function pullRequestChecksStatus(state: PullRequestChecksState) {
  if (state === "passing")
    return { icon: "checkmark.circle", tint: "accent-adaptive-emerald-600-400" } as const;
  if (state === "failing")
    return { icon: "xmark.circle.fill", tint: "accent-danger-foreground" } as const;
  return { icon: "clock", tint: "accent-warning-foreground" } as const;
}
