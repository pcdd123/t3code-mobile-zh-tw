import type {
  EnvironmentId,
  OrchestrationV2PendingBackgroundTask,
  OrchestrationV2ProviderGoal,
  OrchestrationV2ProviderSession,
  ThreadId,
} from "@t3tools/contracts";
import type { EnvironmentThreadShell, ThreadStructure } from "@t3tools/client-runtime/state/shell";
import {
  presentPendingBackgroundWork,
  presentProviderGoal,
  type RunStopPresentation,
} from "@t3tools/client-runtime/state/thread-execution";
import { childThreadInputsTitle } from "@t3tools/client-runtime/state/threads";
import { commandDisplayText } from "@t3tools/client-runtime/work-log/command-label";
import { formatDuration } from "@t3tools/shared/orchestrationTiming";
import * as DateTime from "effect/DateTime";
import {
  CircleDashedIcon,
  CircleStopIcon,
  GitBranchIcon,
  MessageCircleIcon,
  ShieldQuestionIcon,
  TargetIcon,
  TerminalIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Fragment } from "react";
import { tickTextContent } from "~/lib/tickTextContent";
import { localizeDuration, localizeExternalMessage } from "~/i18n/externalMessages";
import { BackgroundWorkDetails } from "./BackgroundWorkDetails";
import { Button, InlineButton } from "../ui/button";
import { Tooltip, TooltipPopup, TooltipTrigger } from "../ui/tooltip";
import { Popover, PopoverPopup, PopoverTrigger } from "../ui/popover";
import type { ComposerBannerStackItem } from "./ComposerBannerStack";
import type { ThreadNowItem } from "./ThreadNow";
import { useGT } from "gt-react";

export function extensionStatusBannerItem(
  statuses: NonNullable<OrchestrationV2ProviderSession["extensionStatuses"]>,
): ComposerBannerStackItem | null {
  if (statuses.length === 0) return null;
  return {
    id: "pi-extension-status",
    variant: "default",
    icon: <span>▸</span>,
    title: <output>{`Pi · ${statuses.map((status) => status.text).join(" · ")}`}</output>,
  };
}

/** Subagents and side chats waiting on the user, unless the parent is itself waiting on them. */
export function childInputNowItem(input: {
  readonly gt: ReturnType<typeof useGT>;
  readonly childThreadInputs: ReadonlyArray<EnvironmentThreadShell>;
  readonly parentAwaitingUser: boolean;
  // A task delegated to a linked environment lives there, not where the parent runs.
  readonly onOpenThread: (threadId: ThreadId, environmentId: EnvironmentId) => void;
}): (ThreadNowItem & { readonly waitingLabel: string }) | null {
  const { gt, childThreadInputs, onOpenThread } = input;
  const first = childThreadInputs[0];
  if (!first || input.parentAwaitingUser) return null;
  return {
    id: `child-input:${first.id}`,
    // The only line at the end of the timeline that needs you gets the info color.
    icon: first.hasPendingApprovals ? (
      <ShieldQuestionIcon className="text-info-foreground" />
    ) : (
      <MessageCircleIcon className="text-info-foreground" />
    ),
    title: childThreadInputsTitle(childThreadInputs),
    waitingLabel: childThreadInputs.every((child) => child.lineage.sideChat === true)
      ? gt("Side chat waiting")
      : gt("Subagent waiting"),
    description: childThreadInputs.map((child, index) => (
      <Fragment key={child.id}>
        {index > 0 ? " " : null}
        <span className="whitespace-nowrap">
          <InlineButton tone="muted" onClick={() => onOpenThread(child.id, child.environmentId)}>
            {child.title}
          </InlineButton>
          {index < childThreadInputs.length - 1 ? "," : null}
        </span>
      </Fragment>
    )),
    actions: (
      <InlineButton onClick={() => onOpenThread(first.id, first.environmentId)}>
        {first.hasPendingApprovals ? gt("Open approval") : gt("Open question")}
      </InlineButton>
    ),
  };
}

/** The thread's goal, for the end of the timeline. */
export function goalNowItem(input: {
  readonly gt: ReturnType<typeof useGT>;
  readonly threadId: ThreadId;
  readonly goal: OrchestrationV2ProviderGoal;
  readonly isWorking: boolean;
  readonly onSendCommand: (text: string, failureMessage: string) => Promise<void>;
}): ThreadNowItem {
  const { gt, isWorking, onSendCommand } = input;
  const presentation = presentProviderGoal(input.goal, isWorking);
  return {
    id: `goal:${input.threadId}`,
    icon: <TargetIcon />,
    title: (
      <Popover>
        <PopoverTrigger openOnHover render={<InlineButton />}>
          {localizeExternalMessage(presentation.title, gt)}
          {presentation.usage === null
            ? null
            : ` · ${localizeExternalMessage(presentation.usage, gt)}`}
        </PopoverTrigger>
        <PopoverPopup side="top" width="md" padding="compact" aria-label={gt("Goal objective")}>
          <p className="whitespace-pre-wrap wrap-anywhere text-sm">{presentation.objective}</p>
        </PopoverPopup>
      </Popover>
    ),
    description: presentation.objective,
    // Clear stops goal work; Resume would stop unrelated work, so it waits.
    actions: (
      <>
        {presentation.canResume && !isWorking ? (
          <>
            <InlineButton
              onClick={() => void onSendCommand("/goal resume", gt("Failed to resume goal."))}
            >
              {gt("Resume")}
            </InlineButton>
            <span aria-hidden>·</span>
          </>
        ) : null}
        <InlineButton
          tone="muted"
          onClick={() => void onSendCommand("/goal clear", gt("Failed to clear goal."))}
        >
          {gt("Clear")}
        </InlineButton>
      </>
    ),
  };
}

/** A Stop the provider has not finished; Force stop once it stops answering. */
export function runStopNowItem(input: {
  readonly gt: ReturnType<typeof useGT>;
  readonly threadId: ThreadId;
  readonly stop: RunStopPresentation;
  readonly canForceStop: boolean;
  readonly forceStopping: boolean;
  readonly onForceStop: () => void;
}): ThreadNowItem {
  const { gt } = input;
  const unresponsive = input.stop.state === "unresponsive";
  const requestedAtMs = Date.parse(input.stop.requestedAt);
  return {
    id: `run-stop:${input.threadId}`,
    icon: unresponsive ? (
      <TriangleAlertIcon className="text-warning-foreground" />
    ) : (
      <CircleStopIcon />
    ),
    title: unresponsive ? gt("Agent not responding to Stop") : gt("Stopping"),
    description: unresponsive
      ? gt("It may be short on memory. Force stop kills its processes.")
      : undefined,
    actions: (
      <>
        <span
          ref={tickTextContent(
            (nowMs) => localizeDuration(formatDuration(Math.max(1_000, nowMs - requestedAtMs)), gt),
            true,
          )}
          className="tabular-nums"
        />
        {unresponsive && input.canForceStop ? (
          <InlineButton disabled={input.forceStopping} onClick={input.onForceStop}>
            {input.forceStopping ? gt("Force stopping...") : gt("Force stop")}
          </InlineButton>
        ) : null}
      </>
    ),
  };
}

/** Background commands and subagents, for the end of the timeline. */
export function backgroundWorkNowItem(input: {
  readonly gt: ReturnType<typeof useGT>;
  readonly environmentId: EnvironmentId;
  readonly threadId: ThreadId;
  readonly tasks: ReadonlyArray<OrchestrationV2PendingBackgroundTask>;
  readonly turnItems: ThreadStructure["turnItems"];
  readonly stopDisabled: boolean;
  readonly stopping: boolean;
  readonly onStop: () => Promise<void>;
  readonly onOpenThread: (threadId: ThreadId) => void;
}): ThreadNowItem | null {
  const { gt, onOpenThread } = input;
  const presentation = presentPendingBackgroundWork(input.tasks);
  if (presentation === null) return null;
  const rows = presentation.items.map((task) => {
    const itemKey =
      input.tasks.find((pending) => pending.taskId === task.taskId)?.nativeItemId ?? task.taskId;
    // Same key derivePendingBackgroundWork gives turn-item tasks; subagent items carry progress.
    const item = input.turnItems.findLast(
      (candidate) => (candidate.nativeItemRef?.nativeId || candidate.id) === itemKey,
    );
    const subagent = item?.type === "subagent" ? item : undefined;
    return {
      task,
      label:
        item?.type === "command_execution" && commandDisplayText(item.input) === task.label ? (
          <span className="font-mono in-data-[slot=popover-popup]:whitespace-pre-wrap">
            {task.label}
          </span>
        ) : task.label.includes("\n") ? (
          <span className="in-data-[slot=popover-popup]:whitespace-pre-wrap">{task.label}</span>
        ) : (
          task.label
        ),
      activity: subagent?.progress?.replace(/\s+/gu, " ").trim() || null,
      startedAtMs: item?.startedAt ? DateTime.toEpochMillis(item.startedAt) : null,
      updatedAtMs: subagent ? DateTime.toEpochMillis(subagent.updatedAt) : 0,
      childThreadId: task.childThreadId ?? subagent?.childThreadId ?? undefined,
    };
  });
  const [only] = rows.length === 1 ? rows : [];
  const newest = rows
    .filter((row) => row.activity)
    .toSorted((left, right) => right.updatedAtMs - left.updatedAtMs)[0];
  const isCommand = (row: (typeof rows)[number]) => row.task.kind !== "subagent";
  const onlyThreadId = only?.childThreadId;
  const startedAtMs = only?.startedAtMs ?? null;
  return {
    id: `background-work:${input.threadId}`,
    icon: rows.every(isCommand) ? <TerminalIcon /> : <CircleDashedIcon />,
    title:
      only && typeof only.label !== "string" && only.task.label !== only.task.kind ? (
        <>
          {presentation.waiting ? gt("Waiting") : gt("Running")} · {only.label}
        </>
      ) : (
        localizeExternalMessage(presentation.title, gt)
      ),
    description: only ? (
      only.activity
    ) : newest ? (
      <>
        {newest.label}: {newest.activity}
      </>
    ) : (
      rows.map((row, index) => (
        <Fragment key={row.task.taskId}>
          {index > 0 ? ", " : null}
          {row.label}
        </Fragment>
      ))
    ),
    actions: (
      <>
        {startedAtMs === null ? null : (
          <span
            ref={tickTextContent(
              (nowMs) => localizeDuration(formatDuration(Math.max(1_000, nowMs - startedAtMs)), gt),
              true,
            )}
            className="tabular-nums"
          />
        )}
        <BackgroundWorkDetails
          environmentId={input.environmentId}
          threadId={input.threadId}
          tasks={input.tasks}
          turnItems={input.turnItems}
          onOpenThread={onOpenThread}
        />
        {onlyThreadId === undefined ? null : (
          <InlineButton tone="muted" onClick={() => onOpenThread(onlyThreadId)}>
            {gt("Open")}
          </InlineButton>
        )}
        <InlineButton disabled={input.stopDisabled} onClick={() => void input.onStop()}>
          {input.stopping ? gt("Stopping...") : gt("Stop")}
        </InlineButton>
      </>
    ),
  };
}

/** The banner is built outside React, so its text renders through this hook-owning component. */
function BranchMismatchText(props: {
  readonly kind: "title" | "tooltip" | "restoring" | "restore";
  readonly threadBranch?: string;
  readonly currentBranch?: string;
}) {
  const gt = useGT();
  switch (props.kind) {
    case "title":
      return gt("Branch changed from");
    case "tooltip":
      return gt(
        "This thread last ran on {threadBranch}. Sending will continue on {currentBranch}.",
        {
          threadBranch: props.threadBranch,
          currentBranch: props.currentBranch,
        },
      );
    case "restoring":
      return gt("Restoring...");
    case "restore":
      return gt("Restore branch");
  }
}

/** The local checkout moved off the branch this thread last ran on. */
export function branchMismatchBannerItem(input: {
  readonly mismatchKey: string;
  readonly mismatch: { readonly threadBranch: string; readonly currentBranch: string };
  readonly restoreDisabled: boolean;
  readonly restoring: boolean;
  readonly onRestore: () => void;
  readonly onDismiss: () => void;
  readonly gt: ReturnType<typeof useGT>;
}): ComposerBannerStackItem {
  const { mismatch, gt } = input;
  return {
    id: `branch-mismatch:${input.mismatchKey}`,
    variant: "info",
    icon: <GitBranchIcon />,
    title: (
      <span className="flex min-w-0 items-baseline gap-1.5">
        <span className="shrink-0 font-normal text-muted-foreground">
          <BranchMismatchText kind="title" />
        </span>
        <Tooltip>
          <TooltipTrigger
            render={
              <code className="min-w-0 truncate font-medium text-foreground">
                {mismatch.threadBranch}
              </code>
            }
          />
          <TooltipPopup side="top">
            <BranchMismatchText
              kind="tooltip"
              threadBranch={mismatch.threadBranch}
              currentBranch={mismatch.currentBranch}
            />
          </TooltipPopup>
        </Tooltip>
      </span>
    ),
    actions: (
      <Button size="xs" variant="ghost" disabled={input.restoreDisabled} onClick={input.onRestore}>
        <BranchMismatchText kind={input.restoring ? "restoring" : "restore"} />
      </Button>
    ),
    dismissLabel: gt("Dismiss branch change notice"),
    onDismiss: input.onDismiss,
  };
}
