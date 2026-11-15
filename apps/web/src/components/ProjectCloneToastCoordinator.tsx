import { useGT } from "gt-react";
import { useParams } from "@tanstack/react-router";
import { scopeProjectRef } from "@t3tools/client-runtime/environment";
import {
  type AtomCommandResult,
  isAtomCommandInterrupted,
  squashAtomCommandFailure,
} from "@t3tools/client-runtime/state/runtime";
import {
  projectCloneDisplayName,
  projectCloneProgressSummary,
  type EnvironmentId,
  type ProjectCloneSnapshot,
  type ProjectId,
} from "@t3tools/contracts";
import { useEffect, useEffectEvent, useRef } from "react";

import { useNewThreadHandler } from "../hooks/useHandleNewThread";
import { useRemoveClonedProject } from "../hooks/useRemoveClonedProject";
import { useEnvironments } from "../state/environments";
import {
  isProjectCloneToastSilenced,
  silenceProjectCloneToasts,
  useEnvironmentProjectClones,
} from "../state/projectClones";
import { sourceControlEnvironment } from "../state/sourceControl";
import { useAtomCommand } from "../state/use-atom-command";
import { type DraftId, useComposerDraftStore } from "../composerDraftStore";
import { toastManager } from "./ui/toast";
import { stackedThreadToast } from "./ui/toastHelpers";

export function ProjectCloneToastCoordinator() {
  const { environments } = useEnvironments();
  return environments.map((environment) => (
    <EnvironmentCloneToasts
      key={environment.environmentId}
      environmentId={environment.environmentId}
    />
  ));
}

interface TrackedToast {
  readonly toastId: ReturnType<typeof toastManager.add>;
  readonly renderedKey: string;
  readonly phase: ProjectCloneSnapshot["phase"];
}

function renderKey(clone: ProjectCloneSnapshot): string {
  return `${clone.phase}:${clone.stage}:${clone.percent ?? ""}:${clone.detail ?? ""}:${clone.stalled === true}:${clone.error ?? ""}`;
}

async function runCloneAction(
  title: string,
  action: () => Promise<AtomCommandResult<unknown, unknown>>,
  fallbackDescription: string,
) {
  const result = await action();
  if (result._tag === "Failure" && !isAtomCommandInterrupted(result)) {
    const error = squashAtomCommandFailure(result);
    toastManager.add(
      stackedThreadToast({
        type: "error",
        title,
        description: error instanceof Error ? error.message : fallbackDescription,
      }),
    );
  }
}

function EnvironmentCloneToasts({ environmentId }: { environmentId: EnvironmentId }) {
  const gt = useGT();
  const clones = useEnvironmentProjectClones(environmentId);
  const handleNewThread = useNewThreadHandler();
  const { draftId: routeDraftId } = useParams({ strict: false });
  const cancelClone = useAtomCommand(sourceControlEnvironment.cancelProjectClone, {
    reportFailure: false,
  });
  const retryClone = useAtomCommand(sourceControlEnvironment.retryProjectClone, {
    reportFailure: false,
  });
  const removeClonedProject = useRemoveClonedProject();
  const toasts = useRef(new Map<ProjectId, TrackedToast>());

  const isViewingProjectDraft = (projectId: ProjectId) => {
    if (!routeDraftId) return false;
    const draft = useComposerDraftStore.getState().getDraftSession(routeDraftId as DraftId);
    return draft?.environmentId === environmentId && draft.projectId === projectId;
  };

  const openProject = (projectId: ProjectId) => {
    void handleNewThread(scopeProjectRef(environmentId, projectId));
  };

  const readToastText = useEffectEvent((repository: string) => ({
    cloning: gt("Cloning {repository}", { repository }),
    cancel: gt("Cancel"),
    failedToCancel: gt("Failed to cancel clone"),
    cloned: gt("Cloned {repository}", { repository }),
    openProject: gt("Open project"),
    cancelled: gt("Cancelled cloning {repository}", { repository }),
    failed: gt("Failed to clone {repository}", { repository }),
    cloneFailed: gt("The clone failed."),
    retry: gt("Retry"),
    failedToRetry: gt("Failed to retry clone"),
    removeProject: gt("Remove project"),
    errorOccurred: gt("An error occurred."),
  }));

  // oxlint-disable-next-line t3code/no-unreasoned-state-sync -- opens, updates and closes imperative toastManager toasts to match the current project clones
  useEffect(() => {
    const seen = new Set<ProjectId>();
    for (const clone of clones) {
      seen.add(clone.projectId);
      const key = renderKey(clone);
      const tracked = toasts.current.get(clone.projectId);
      const name = projectCloneDisplayName(clone);
      const closeToast = () => {
        const current = toasts.current.get(clone.projectId);
        if (!current) return;
        toastManager.close(current.toastId);
        toasts.current.delete(clone.projectId);
      };
      const ref = { environmentId, projectId: clone.projectId };
      if (isViewingProjectDraft(clone.projectId)) {
        silenceProjectCloneToasts(ref);
        closeToast();
        continue;
      }
      if (tracked?.renderedKey === key) continue;
      const text = readToastText(name);
      if (
        isProjectCloneToastSilenced(ref) &&
        (clone.phase === "running" || clone.phase === "done")
      ) {
        closeToast();
        continue;
      }

      if (clone.phase === "running") {
        const options = stackedThreadToast({
          type: "loading",
          title: text.cloning,
          description: projectCloneProgressSummary(clone),
          timeout: 0,
          actionProps: {
            children: text.cancel,
            onClick: () => {
              void runCloneAction(
                text.failedToCancel,
                () => cancelClone({ environmentId, input: { projectId: clone.projectId } }),
                text.errorOccurred,
              );
            },
          },
          data: { hideCopyButton: true },
        });
        if (tracked) {
          toastManager.update(tracked.toastId, options);
          toasts.current.set(clone.projectId, { ...tracked, renderedKey: key, phase: "running" });
        } else {
          const toastId = toastManager.add(options);
          toasts.current.set(clone.projectId, { toastId, renderedKey: key, phase: "running" });
        }
        continue;
      }

      if (clone.phase === "done") {
        const options = stackedThreadToast({
          type: "success",
          title: text.cloned,
          description: clone.destinationPath,
          timeout: 8_000,
          actionProps: {
            children: text.openProject,
            onClick: () => {
              closeToast();
              openProject(clone.projectId);
            },
          },
          data: { hideCopyButton: true },
        });
        if (tracked) {
          toastManager.update(tracked.toastId, options);
          toasts.current.set(clone.projectId, { ...tracked, renderedKey: key, phase: "done" });
        } else {
          const toastId = toastManager.add(options);
          toasts.current.set(clone.projectId, { toastId, renderedKey: key, phase: "done" });
        }
        continue;
      }

      const cancelled = clone.phase === "cancelled";
      const options = stackedThreadToast({
        type: cancelled ? "info" : "error",
        title: cancelled ? text.cancelled : text.failed,
        description: cancelled ? clone.destinationPath : (clone.error ?? text.cloneFailed),
        timeout: 0,
        actionProps: {
          children: text.retry,
          onClick: () => {
            void runCloneAction(
              text.failedToRetry,
              () => retryClone({ environmentId, input: { projectId: clone.projectId } }),
              text.errorOccurred,
            );
          },
        },
        data: {
          ...(cancelled ? { hideCopyButton: true } : {}),
          secondaryActionProps: {
            children: text.removeProject,
            onClick: () => {
              void removeClonedProject({ environmentId, projectId: clone.projectId });
            },
          },
        },
      });
      if (tracked) {
        toastManager.update(tracked.toastId, options);
        toasts.current.set(clone.projectId, { ...tracked, renderedKey: key, phase: clone.phase });
      } else {
        const toastId = toastManager.add(options);
        toasts.current.set(clone.projectId, { toastId, renderedKey: key, phase: clone.phase });
      }
    }

    for (const [projectId, tracked] of toasts.current) {
      if (seen.has(projectId)) continue;
      if (tracked.phase !== "done") toastManager.close(tracked.toastId);
      toasts.current.delete(projectId);
    }
  }, [
    cancelClone,
    clones,
    environmentId,
    isViewingProjectDraft,
    openProject,
    removeClonedProject,
    retryClone,
  ]);

  // oxlint-disable-next-line t3code/no-unreasoned-state-sync -- closes every tracked clone toast in toastManager when the coordinator unmounts
  useEffect(
    () => () => {
      for (const tracked of toasts.current.values()) toastManager.close(tracked.toastId);
      toasts.current.clear();
    },
    [],
  );

  return null;
}
