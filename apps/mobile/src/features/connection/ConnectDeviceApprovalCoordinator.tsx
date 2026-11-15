import { AuthAccessWriteScope, type AuthPairingLink, type EnvironmentId } from "@t3tools/contracts";
import { useEffect, useEffectEvent } from "react";
import "../../i18n/intl-polyfills";
import { useGT } from "gt-react-native";

import * as Dialog from "../../components/ui/Dialog";
import { authEnvironment } from "../../state/auth";
import { useEnvironments } from "../../state/environments";
import { useEnvironmentQuery } from "../../state/query";
import { useEnvironmentsWithScope } from "../../state/session";
import { useAtomCommand } from "../../state/use-atom-command";
import {
  type ConnectDeviceApprovalPrompt,
  connectDeviceApprovalPrompts,
  createApprovalPromptQueue,
} from "./connectDeviceApproval";

/** Asks to approve T3 Connect devices waiting on hosts that require it and this phone manages. */
export function ConnectDeviceApprovalCoordinator() {
  const { environments } = useEnvironments();
  const requiring = environments.filter(
    (environment) =>
      environment.connection.phase === "connected" &&
      environment.serverConfig?.settings.requireConnectDeviceApproval === true,
  );
  const managed = useEnvironmentsWithScope(requiring, AuthAccessWriteScope);
  return (
    <>
      {requiring
        .filter((environment) => managed.has(environment.environmentId))
        .map((environment) => (
          <EnvironmentApprovalWatcher
            key={environment.environmentId}
            environmentId={environment.environmentId}
            environmentLabel={environment.label}
          />
        ))}
    </>
  );
}

/** "gone": the request expired or was answered elsewhere before this answer arrived. */
type ApprovalAnswer = "done" | "failed" | "gone";

interface QueuedApprovalPrompt extends ConnectDeviceApprovalPrompt {
  readonly environmentId: EnvironmentId;
  readonly approve: () => Promise<ApprovalAnswer>;
  readonly deny: () => Promise<ApprovalAnswer>;
  readonly labels: {
    readonly goneTitle: string;
    readonly goneMessage: string;
    readonly ok: string;
    readonly waiting: string;
    readonly deny: string;
    readonly approve: string;
    readonly denyFailed: string;
    readonly approveFailed: string;
  };
}

const watchedEnvironments = new Set<EnvironmentId>();

// One queue for every host: a second Android alert would replace an unanswered first one.
const approvalPrompts = createApprovalPromptQueue<QueuedApprovalPrompt>((prompt, answer) => {
  const respond = (action: () => Promise<ApprovalAnswer>, failure: string) => () =>
    void action().then((outcome) => {
      // A host that went away or lost access cannot be retried; let the next prompt show.
      if (outcome === "done" || !watchedEnvironments.has(prompt.environmentId)) {
        return answer("done");
      }
      if (outcome === "gone") {
        return Dialog.alert(
          prompt.labels.goneTitle,
          prompt.labels.goneMessage,
          [{ text: prompt.labels.ok, onPress: () => answer("done") }],
          { onDismiss: () => answer("done") },
        );
      }
      const retryIfWatched = () =>
        answer(watchedEnvironments.has(prompt.environmentId) ? "retry" : "done");
      Dialog.alert(
        failure,
        prompt.labels.waiting,
        [{ text: prompt.labels.ok, onPress: retryIfWatched }],
        // Another dialog took the screen; offer the request again on the next update.
        { onDismiss: () => answer("later") },
      );
    });
  Dialog.alert(
    prompt.title,
    prompt.message,
    [
      { text: prompt.labels.deny, onPress: respond(prompt.deny, prompt.labels.denyFailed) },
      {
        text: prompt.labels.approve,
        onPress: respond(prompt.approve, prompt.labels.approveFailed),
      },
    ],
    // Another dialog took the screen; offer the request again on the next update.
    { cancelable: false, onDismiss: () => answer("later") },
  );
});

function EnvironmentApprovalWatcher(props: {
  readonly environmentId: EnvironmentId;
  readonly environmentLabel: string;
}) {
  const gt = useGT();
  const access = useEnvironmentQuery(
    authEnvironment.accessChanges({ environmentId: props.environmentId, input: null }),
  );
  const approve = useAtomCommand(authEnvironment.approveConnectDevice, { reportFailure: false });
  const deny = useAtomCommand(authEnvironment.revokePairingLink, { reportFailure: false });
  const pairingLinks =
    access.data?.type === "snapshot" ? access.data.payload.pairingLinks : undefined;

  const offerPrompts = useEffectEvent((links: ReadonlyArray<AuthPairingLink>) => {
    const prompts = connectDeviceApprovalPrompts({
      environmentLabel: props.environmentLabel,
      pairingLinks: links,
      shownIds: approvalPrompts.known,
    });
    approvalPrompts.offer(
      prompts.map((prompt) => ({
        ...prompt,
        title: gt("Approve this device?"),
        message: gt(
          "{device} wants to connect to {environment} through T3 Connect. It shows code {code}. Approve it only if that code matches.",
          {
            device: prompt.deviceName,
            environment: props.environmentLabel,
            code: prompt.verificationCode,
          },
        ),
        labels: {
          goneTitle: gt("Request no longer waiting"),
          goneMessage: gt("It expired or was answered elsewhere."),
          ok: gt("OK"),
          waiting: gt("The request is still waiting. Try again."),
          deny: gt("Deny"),
          approve: gt("Approve"),
          denyFailed: gt("Could not deny the device"),
          approveFailed: gt("Could not approve the device"),
        },
        environmentId: props.environmentId,
        approve: () =>
          approve({
            environmentId: props.environmentId,
            input: { pairingLinkId: prompt.pairingLinkId },
          }).then((result) =>
            result._tag !== "Success" ? "failed" : result.value.approved ? "done" : "gone",
          ),
        deny: () =>
          deny({ environmentId: props.environmentId, input: { id: prompt.pairingLinkId } }).then(
            (result) =>
              result._tag !== "Success" ? "failed" : result.value.revoked ? "done" : "gone",
          ),
      })),
    );
  });
  // oxlint-disable-next-line t3code/no-unreasoned-state-sync -- registers this host with the module-level prompt queue and drops its prompts when it goes away
  useEffect(() => {
    const environmentId = props.environmentId;
    watchedEnvironments.add(environmentId);
    return () => {
      watchedEnvironments.delete(environmentId);
      approvalPrompts.drop((prompt) => prompt.environmentId === environmentId);
    };
  }, [props.environmentId]);
  // oxlint-disable-next-line t3code/no-unreasoned-state-sync -- a new request on the access stream opens a native alert
  useEffect(() => {
    if (pairingLinks !== undefined) offerPrompts(pairingLinks);
  }, [pairingLinks]);

  return null;
}
