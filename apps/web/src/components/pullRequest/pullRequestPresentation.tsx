import { Spinner } from "~/components/ui/spinner";
import type {
  PullRequestActor,
  PullRequestCheck,
  PullRequestCheckStatus,
  PullRequestChecksState,
  PullRequestLabel,
  PullRequestMergeability,
  PullRequestReviewDecision,
  PullRequestState,
} from "@t3tools/contracts";
import { formatDiffCount } from "@t3tools/client-runtime/diff-count";
import {
  CircleCheckIcon,
  CircleDashedIcon,
  CircleDotIcon,
  CircleSlashIcon,
  CircleXIcon,
  OctagonXIcon,
  UserCheckIcon,
  UserRoundIcon,
  UserRoundXIcon,
} from "lucide-react";
import { useGT } from "gt-react";
import { Children, type CSSProperties, isValidElement, type ReactNode, useState } from "react";

import { cn } from "~/lib/utils";

import { Badge } from "../ui/badge";
import { InlineButton } from "../ui/button";
import { Tooltip, TooltipPopup, TooltipTrigger } from "../ui/tooltip";
import type { PullRequestReviewOutcome } from "./pullRequestDetail.logic";
import { pullRequestLabelColor } from "./pullRequestList.logic";
import {
  PULL_REQUEST_STATE_PRESENTATION,
  PullRequestGlyph,
  type PullRequestStatePresentation,
  type PullRequestGlyphIcon,
} from "./pullRequestIcons";

type Translate = ReturnType<typeof useGT>;

export function PullRequestLabelChip({
  label,
  size = "sm",
  className,
  focusable = false,
  children,
}: {
  label: Pick<PullRequestLabel, "name" | "color" | "description">;
  size?: "sm" | "default";
  className?: string;
  focusable?: boolean;
  children?: ReactNode;
}) {
  const color = pullRequestLabelColor(label.color);
  const badge = (
    <Badge
      size={size}
      variant={color ? "label" : "secondary"}
      className={cn("min-w-0 max-w-40 shrink justify-start", className)}
      {...(focusable && label.description ? { tabIndex: 0 } : {})}
      {...(color ? { style: { "--label": color } as CSSProperties } : {})}
    >
      <span className="truncate">{label.name}</span>
      {label.description ? <span className="sr-only">: {label.description}</span> : null}
      {children}
    </Badge>
  );
  if (!label.description) return badge;
  return (
    <Tooltip>
      <TooltipTrigger render={badge} />
      <TooltipPopup>{label.description}</TooltipPopup>
    </Tooltip>
  );
}

function reviewDecisionPresentation(decision: PullRequestReviewDecision, gt: Translate) {
  switch (decision) {
    case "approved":
      return {
        Icon: UserCheckIcon,
        label: gt("Approved"),
        toneClassName: CHECK_STATUS_PRESENTATION.success.toneClassName,
      };
    case "changes-requested":
      return {
        Icon: UserRoundXIcon,
        label: gt("Changes requested"),
        toneClassName: "text-amber-600/90 dark:text-amber-400/80",
      };
    case "review-required":
      return {
        Icon: UserRoundIcon,
        label: gt("Awaiting review"),
        toneClassName: "text-muted-foreground/60",
      };
  }
}

export function PullRequestReviewDecisionGlyph({
  decision,
}: {
  decision: PullRequestReviewDecision;
}) {
  const gt = useGT();
  const presentation = reviewDecisionPresentation(decision, gt);
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex shrink-0" />}>
        <presentation.Icon aria-hidden className={cn("size-3.5", presentation.toneClassName)} />
        <span className="sr-only">{presentation.label}</span>
      </TooltipTrigger>
      <TooltipPopup>{presentation.label}</TooltipPopup>
    </Tooltip>
  );
}

export function resolvePullRequestState(input: {
  readonly state: PullRequestState;
  readonly isDraft: boolean;
}): PullRequestStatePresentation {
  const key = input.state === "open" && input.isDraft ? "draft" : input.state;
  return PULL_REQUEST_STATE_PRESENTATION[key];
}

/** Translates the English label `resolvePullRequestState` returns, which stays the source value. */
export function pullRequestStateLabel(
  presentation: Pick<PullRequestStatePresentation, "label">,
  gt: Translate,
): string {
  switch (presentation.label) {
    case "Open":
      return gt("Open");
    case "Draft":
      return gt("Draft");
    case "Closed":
      return gt("Closed");
    case "Merged":
      return gt("Merged");
    default:
      return presentation.label;
  }
}

/** Translates a host's change request term, such as "pull request" or "MR". */
export function changeRequestTerm(term: string, gt: Translate): string {
  switch (term) {
    case "pull request":
      return gt("pull request");
    case "pull requests":
      return gt("pull requests");
    case "merge request":
      return gt("merge request");
    case "merge requests":
      return gt("merge requests");
    case "change request":
      return gt("change request");
    case "change requests":
      return gt("change requests");
    case "PR":
      return gt("PR");
    case "MR":
      return gt("MR");
    case "a PR":
      return gt("a PR");
    case "an MR":
      return gt("an MR");
    case "a change request":
      return gt("a change request");
    default:
      return term;
  }
}

export interface PullRequestConflictPresentation {
  readonly label: string;
  readonly toneClassName: string;
  readonly Icon: PullRequestGlyphIcon;
}

function resolvePullRequestConflict(
  input: {
    readonly state: PullRequestState;
    readonly isDraft: boolean;
    readonly mergeability?: PullRequestMergeability;
    readonly baseBranch?: string;
  },
  gt: Translate,
): PullRequestConflictPresentation | null {
  if (input.state !== "open" || input.isDraft || input.mergeability !== "conflicting") {
    return null;
  }
  return {
    label: input.baseBranch
      ? gt("Conflicts with {baseBranch}", { baseBranch: input.baseBranch })
      : gt("Has conflicts"),
    toneClassName: "text-destructive",
    Icon: PullRequestGlyph.conflicting,
  };
}

export function PullRequestStateGlyph({
  state,
  isDraft,
  className,
}: {
  state: PullRequestState;
  isDraft: boolean;
  className?: string;
}) {
  const gt = useGT();
  const presentation = resolvePullRequestState({ state, isDraft });
  const label = pullRequestStateLabel(presentation, gt);
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex shrink-0" />}>
        <presentation.Icon
          role="img"
          aria-label={label}
          className={cn("size-4 shrink-0", presentation.toneClassName, className)}
        />
      </TooltipTrigger>
      <TooltipPopup>{label}</TooltipPopup>
    </Tooltip>
  );
}

export function PullRequestConflictGlyph({
  state,
  isDraft,
  mergeability,
  baseBranch,
  className,
}: {
  state: PullRequestState;
  isDraft: boolean;
  mergeability?: PullRequestMergeability;
  baseBranch?: string;
  className?: string;
}) {
  const gt = useGT();
  const presentation = resolvePullRequestConflict(
    {
      state,
      isDraft,
      ...(mergeability === undefined ? {} : { mergeability }),
      ...(baseBranch === undefined ? {} : { baseBranch }),
    },
    gt,
  );
  if (presentation === null) return null;
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex shrink-0" />}>
        <presentation.Icon
          role="img"
          aria-label={presentation.label}
          className={cn("size-4 shrink-0", presentation.toneClassName, className)}
        />
      </TooltipTrigger>
      <TooltipPopup>{presentation.label}</TooltipPopup>
    </Tooltip>
  );
}

const CHECK_STATUS_PRESENTATION = {
  pending: { label: "Running", Icon: Spinner, toneClassName: "text-amber-500" },
  "action-required": {
    label: "Awaiting action",
    Icon: CircleDotIcon,
    toneClassName: "text-amber-600 dark:text-amber-400/90",
  },
  success: {
    label: "Passed",
    Icon: CircleCheckIcon,
    toneClassName: "text-emerald-600 dark:text-emerald-300/90",
  },
  failure: { label: "Failed", Icon: CircleXIcon, toneClassName: "text-destructive" },
  cancelled: {
    label: "Cancelled",
    Icon: OctagonXIcon,
    toneClassName: "text-muted-foreground/70",
  },
  skipped: { label: "Skipped", Icon: CircleSlashIcon, toneClassName: "text-muted-foreground/70" },
  neutral: { label: "Neutral", Icon: CircleDashedIcon, toneClassName: "text-muted-foreground/70" },
} as const satisfies Record<
  PullRequestCheckStatus,
  { label: string; Icon: typeof CircleCheckIcon | typeof Spinner; toneClassName: string }
>;

function isWorkflowApprovalCheck(check: Pick<PullRequestCheck, "status" | "url">): boolean {
  return (
    check.status === "action-required" &&
    check.url !== null &&
    /\/actions\/runs\/\d+(?:\/|$)/u.test(check.url)
  );
}

function checkStatusLabel(status: PullRequestCheckStatus, gt: Translate): string {
  switch (status) {
    case "pending":
      return gt("Running");
    case "action-required":
      return gt("Awaiting action");
    case "success":
      return gt("Passed");
    case "failure":
      return gt("Failed");
    case "cancelled":
      return gt("Cancelled");
    case "skipped":
      return gt("Skipped");
    case "neutral":
      return gt("Neutral");
  }
}

export function pullRequestCheckStatusLabel(
  check: Pick<PullRequestCheck, "status" | "url">,
  gt: Translate,
): string {
  return isWorkflowApprovalCheck(check)
    ? gt("Awaiting approval")
    : checkStatusLabel(check.status, gt);
}

export function PullRequestCheckStatusIcon({ status }: { status: PullRequestCheckStatus }) {
  const presentation = CHECK_STATUS_PRESENTATION[status];
  return (
    <presentation.Icon
      aria-hidden
      className={cn("size-3.5 shrink-0", presentation.toneClassName)}
    />
  );
}

const CHECKS_STATE_PRESENTATION = {
  passing: {
    label: "All checks have passed",
    Icon: CircleCheckIcon,
    toneClassName: CHECK_STATUS_PRESENTATION.success.toneClassName,
  },
  failing: {
    label: "Some checks were not successful",
    Icon: CircleXIcon,
    toneClassName: "text-destructive",
  },
  pending: {
    label: "Some checks haven't completed yet",
    Icon: CircleDotIcon,
    toneClassName: "text-amber-600 dark:text-amber-400/90",
  },
} as const satisfies Record<
  PullRequestChecksState,
  { label: string; Icon: typeof CircleCheckIcon; toneClassName: string }
>;

export function pullRequestChecksStatePresentation(state: PullRequestChecksState) {
  return CHECKS_STATE_PRESENTATION[state];
}

export function pullRequestChecksStateLabel(state: PullRequestChecksState, gt: Translate): string {
  switch (state) {
    case "passing":
      return gt("All checks have passed");
    case "failing":
      return gt("Some checks were not successful");
    case "pending":
      return gt("Some checks haven't completed yet");
  }
}

export function pullRequestChecksState(
  checks: ReadonlyArray<PullRequestCheck>,
): PullRequestChecksState | null {
  if (checks.length === 0) return null;
  const statuses = new Set(checks.map((check) => check.status));
  if (statuses.has("failure") || statuses.has("cancelled")) return "failing";
  if (statuses.has("pending") || statuses.has("action-required")) return "pending";
  return statuses.has("success") ? "passing" : null;
}

const REVIEW_OUTCOME_PRESENTATION = {
  approved: {
    label: "Approved",
    Icon: CircleCheckIcon,
    toneClassName: "text-emerald-600 dark:text-emerald-300/90",
    ringClassName: "ring-2 ring-emerald-500 dark:ring-emerald-400",
    staleRingClassName:
      "ring-2 ring-[color-mix(in_srgb,var(--color-emerald-500)_35%,var(--background))] dark:ring-[color-mix(in_srgb,var(--color-emerald-400)_35%,var(--background))]",
    fillClassName: "fill-emerald-500 dark:fill-emerald-400",
    badgeVariant: "success",
  },
  "changes-requested": {
    label: "Changes requested",
    Icon: CircleXIcon,
    toneClassName: "text-destructive",
    ringClassName: "ring-2 ring-destructive",
    staleRingClassName: "ring-2 ring-[color-mix(in_srgb,var(--destructive)_35%,var(--background))]",
    fillClassName: "fill-destructive",
    badgeVariant: "error",
  },
  dismissed: {
    label: "Review dismissed",
    Icon: CircleDashedIcon,
    toneClassName: "text-muted-foreground/70",
    ringClassName: "ring-2 ring-muted-foreground/60",
    staleRingClassName:
      "ring-2 ring-[color-mix(in_srgb,var(--contrast-muted-foreground)_30%,var(--background))]",
    fillClassName: "fill-muted-foreground",
    badgeVariant: "outline",
  },
} as const satisfies Record<
  PullRequestReviewOutcome,
  {
    label: string;
    Icon: typeof CircleCheckIcon;
    toneClassName: string;
    ringClassName: string;
    staleRingClassName: string;
    fillClassName: string;
    badgeVariant: "success" | "error" | "outline";
  }
>;

export function pullRequestReviewOutcomeToneClassName(outcome: PullRequestReviewOutcome): string {
  return REVIEW_OUTCOME_PRESENTATION[outcome].toneClassName;
}

// Mix rings with the background to prevent avatars showing through their overlap.
export function pullRequestReviewOutcomeRingClassName(
  outcome: PullRequestReviewOutcome,
  stale = false,
): string {
  const presentation = REVIEW_OUTCOME_PRESENTATION[outcome];
  return stale ? presentation.staleRingClassName : presentation.ringClassName;
}

export function pullRequestReviewOutcomeStaleLabel(
  outcome: PullRequestReviewOutcome,
  gt: Translate,
): string {
  switch (outcome) {
    case "approved":
      return gt("Approved earlier changes");
    case "changes-requested":
      return gt("Changes requested earlier changes");
    case "dismissed":
      return gt("Review dismissed earlier changes");
  }
}

export function PullRequestReviewOutcomeIcon({
  outcome,
  className,
}: {
  outcome: PullRequestReviewOutcome;
  className?: string;
}) {
  const presentation = REVIEW_OUTCOME_PRESENTATION[outcome];
  return (
    <presentation.Icon
      aria-hidden
      className={cn("size-3.5 shrink-0", presentation.toneClassName, className)}
    />
  );
}

// Ring color alone blends into colorful bot avatars; the glyph gives each verdict a shape.
export function PullRequestReviewOutcomeAvatarBadge({
  outcome,
  stale = false,
}: {
  outcome: PullRequestReviewOutcome;
  stale?: boolean;
}) {
  const presentation = REVIEW_OUTCOME_PRESENTATION[outcome];
  return (
    <presentation.Icon
      aria-hidden
      strokeWidth={3}
      className={cn(
        "absolute -right-1 -bottom-1 size-3 text-background",
        presentation.fillClassName,
        stale && "opacity-50",
      )}
    />
  );
}

export function pullRequestReviewOutcomeLabel(
  outcome: PullRequestReviewOutcome,
  gt: Translate,
): string {
  switch (outcome) {
    case "approved":
      return gt("Approved");
    case "changes-requested":
      return gt("Changes requested");
    case "dismissed":
      return gt("Review dismissed");
  }
}

export function PullRequestReviewOutcomeBadge({
  outcome,
  className,
}: {
  outcome: PullRequestReviewOutcome;
  className?: string;
}) {
  const gt = useGT();
  const presentation = REVIEW_OUTCOME_PRESENTATION[outcome];
  return (
    <Badge size="sm" variant={presentation.badgeVariant} className={className}>
      <span className="inline-flex items-baseline gap-1">
        <presentation.Icon aria-hidden className="size-3 self-center" />
        <span>{pullRequestReviewOutcomeLabel(outcome, gt)}</span>
      </span>
    </Badge>
  );
}

export function PullRequestActorAvatar({
  actor,
  className,
}: {
  actor: PullRequestActor | null;
  className?: string;
}) {
  const login = actor?.login ?? "ghost";
  const avatarUrl = actor?.avatarUrl ?? null;
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);
  return avatarUrl === null || failedAvatarUrl === avatarUrl ? (
    <span
      aria-hidden
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-full bg-muted text-3xs font-medium text-muted-foreground",
        className,
      )}
    >
      {login.slice(0, 1).toUpperCase()}
    </span>
  ) : (
    <img
      aria-hidden
      alt=""
      src={avatarUrl}
      loading="lazy"
      className={cn("size-4 shrink-0 rounded-full bg-muted object-cover", className)}
      onError={() => setFailedAvatarUrl(avatarUrl)}
    />
  );
}

export function PullRequestActorLabel({
  actor,
  className,
  variant = "label",
  tooltip = true,
  profileUrl,
}: {
  actor: PullRequestActor | null;
  className?: string;
  variant?: "label" | "avatar";
  tooltip?: boolean;
  profileUrl?: string | null;
}) {
  const gt = useGT();
  const login = actor?.login ?? "ghost";
  const label = (
    <span className={cn("flex min-w-0 items-baseline", variant === "label" && "gap-1.5")}>
      <PullRequestActorAvatar actor={actor} className="self-center" />
      <span className={variant === "label" ? "truncate font-medium text-foreground" : "sr-only"}>
        {login}
      </span>
    </span>
  );
  const placement = cn("flex min-w-0 shrink", className);
  if (!tooltip) return <span className={placement}>{label}</span>;
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          profileUrl ? (
            <InlineButton
              className={placement}
              render={
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={gt("Open {login}'s profile", { login })}
                />
              }
            />
          ) : (
            <span className={placement} />
          )
        }
      >
        {label}
      </TooltipTrigger>
      <TooltipPopup side="top">
        {actor?.name && actor.name !== login ? `${actor.name} (@${login})` : login}
        {profileUrl ? ` · ${gt("Open profile")}` : ""}
      </TooltipPopup>
    </Tooltip>
  );
}

export function PullRequestDiffStat({
  additions,
  deletions,
  className,
}: {
  additions: number;
  deletions: number;
  className?: string;
}) {
  if (additions === 0 && deletions === 0) {
    return null;
  }
  return (
    <span className={cn("inline-flex items-baseline gap-1 tabular-nums", className)}>
      <span className="text-diff-addition-foreground">+{formatDiffCount(additions)}</span>
      <span className="text-diff-deletion">-{formatDiffCount(deletions)}</span>
    </span>
  );
}

function separatorKey(segment: ReactNode): string {
  return `separator:${isValidElement(segment) ? String(segment.key) : String(segment)}`;
}

export function PullRequestMetaLine({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const segments = Children.toArray(children);
  return (
    <span className={cn("flex min-w-0 items-center gap-1.5", className)}>
      {segments.flatMap((segment, index) =>
        index === 0
          ? segment
          : [
              <span
                aria-hidden
                className="shrink-0 text-muted-foreground/50"
                key={separatorKey(segment)}
              >
                ·
              </span>,
              segment,
            ],
      )}
    </span>
  );
}

export function summarizePullRequestChecks(
  checks: ReadonlyArray<PullRequestCheck>,
  gt: Translate,
): string {
  if (checks.length === 0) return gt("No checks reported");
  const actionRequired = checks.filter((check) => check.status === "action-required");
  const workflowApprovalRequired = actionRequired.filter(isWorkflowApprovalCheck).length;
  const otherActionRequired = actionRequired.length - workflowApprovalRequired;
  const failed = checks.filter(
    (check) => check.status === "failure" || check.status === "cancelled",
  ).length;
  const pending = checks.filter((check) => check.status === "pending").length;
  const passed = checks.filter((check) => check.status === "success").length;
  const total = checks.length;
  if (failed > 0) return gt("{failed} of {total} failing", { failed, total });
  if (workflowApprovalRequired > 0 && otherActionRequired > 0) {
    const workflows =
      workflowApprovalRequired === 1
        ? gt("1 workflow")
        : gt("{count} workflows", { count: workflowApprovalRequired });
    const others =
      otherActionRequired === 1
        ? gt("1 check")
        : gt("{count} checks", { count: otherActionRequired });
    return gt("{workflows} and {checks} awaiting action", { workflows, checks: others });
  }
  if (workflowApprovalRequired > 0) {
    return workflowApprovalRequired === 1
      ? gt("1 workflow awaiting approval")
      : gt("{count} workflows awaiting approval", { count: workflowApprovalRequired });
  }
  if (otherActionRequired > 0) {
    return otherActionRequired === 1
      ? gt("1 check awaiting action")
      : gt("{count} checks awaiting action", { count: otherActionRequired });
  }
  if (pending > 0) return gt("{pending} of {total} running", { pending, total });
  return passed === total
    ? gt("All checks passed")
    : gt("{passed} of {total} passing", { passed, total });
}
