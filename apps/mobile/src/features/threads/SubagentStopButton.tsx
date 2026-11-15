import { useAtomValue } from "@effect/atom-react";
import type { EnvironmentId, OrchestrationV2Subagent } from "@t3tools/contracts";
import { useGT } from "gt-react-native";
import { useState } from "react";
import { View } from "react-native";

import * as Dialog from "../../components/ui/Dialog";
import { IconButton } from "../../components/ui/IconButton";
import { orchestrationEnvironment } from "../../state/orchestration";
import { threadEnvironment } from "../../state/threads";
import { useAtomCommand } from "../../state/use-atom-command";
import {
  localizeSubagentRowPresentation,
  resolveSubagentRowPresentation,
  resolveSubagentStopTarget,
} from "./threadAgentsPresentation";

export function SubagentStopButton(props: {
  readonly environmentId: EnvironmentId;
  readonly subagent: OrchestrationV2Subagent;
  readonly className?: string;
}) {
  const gt = useGT();
  const target = resolveSubagentStopTarget(props.subagent);
  const canStop = useAtomValue(
    orchestrationEnvironment.stopWorkflow.permissionAtom(props.environmentId),
  );
  const stopWorkflow = useAtomCommand(orchestrationEnvironment.stopWorkflow);
  const interruptTurn = useAtomCommand(threadEnvironment.interruptTurn);
  const [stopping, setStopping] = useState(false);

  if (target === null || !canStop) return null;

  const workflow = target.kind === "workflow";
  const label =
    props.subagent.workflow?.name ??
    localizeSubagentRowPresentation(
      resolveSubagentRowPresentation(props.subagent),
      props.subagent.status,
      gt,
    ).title;

  const stop = async () => {
    setStopping(true);
    const result = await (
      target.kind === "workflow"
        ? stopWorkflow({ environmentId: props.environmentId, input: target.input })
        : interruptTurn({ environmentId: props.environmentId, input: target.input })
    ).finally(() => setStopping(false));
    if (result._tag === "Failure") {
      Dialog.alert(workflow ? gt("Could not stop workflow") : gt("Could not stop agent"));
    }
  };

  return (
    <View className={props.className}>
      <IconButton
        icon="stop.fill"
        variant="danger"
        accessibilityLabel={
          workflow
            ? stopping
              ? gt("Stopping workflow {name}", { name: label })
              : gt("Stop workflow {name}", { name: label })
            : stopping
              ? gt("Stopping agent {name}", { name: label })
              : gt("Stop agent {name}", { name: label })
        }
        disabled={stopping}
        onPress={() =>
          Dialog.confirm({
            title: workflow ? gt("Stop workflow?") : gt("Stop agent?"),
            message: workflow
              ? gt("Every running agent in {name} stops.", { name: label })
              : gt("Stop {name}?", { name: label }),
            confirmText: gt("Stop"),

            destructive: true,
            onConfirm: () => void stop(),
          })
        }
      />
    </View>
  );
}
