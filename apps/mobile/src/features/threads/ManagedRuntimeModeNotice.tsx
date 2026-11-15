import {
  clampManagedRuntimeMode,
  managedRuntimeModeDenial,
  type ManagedPolicySummary,
  type RuntimeMode,
} from "@t3tools/contracts";
import { View } from "react-native";
import { useGT } from "gt-react-native";
import { localizeExternalMessage } from "../../i18n/externalMessages";

import { AppText } from "../../components/ui/AppText";
import { Button } from "../../components/ui/Button";
import {
  updateComposerDraftSettings,
  useComposerDraftSettings,
} from "../../state/use-composer-drafts";
import { runtimeModeChoicesForSupportedModes, runtimeModeLabel } from "./thread-settings-options";

/**
 * Shown while a thread's mode is above its environment's managed ceiling, where the server
 * refuses every turn. Switching sets the draft's mode, which the next send applies first.
 */
export function ManagedRuntimeModeNotice(props: {
  readonly threadKey: string;
  readonly threadRuntimeMode: RuntimeMode;
  readonly supportedRuntimeModes: ReadonlyArray<RuntimeMode> | undefined;
  readonly policy: ManagedPolicySummary | undefined;
}) {
  const gt = useGT();
  const draftSettings = useComposerDraftSettings(props.threadKey);
  const runtimeMode = draftSettings.runtimeMode ?? props.threadRuntimeMode;
  const denial = managedRuntimeModeDenial(props.policy, runtimeMode);
  if (denial === undefined) return null;
  const choices = runtimeModeChoicesForSupportedModes(props.supportedRuntimeModes);
  const target = clampManagedRuntimeMode(
    props.policy,
    runtimeMode,
    choices.map((choice) => choice.mode),
  );
  const targetLabel =
    target !== undefined && choices.some((choice) => choice.mode === target)
      ? runtimeModeLabel(target, gt)
      : undefined;
  return (
    <View className="gap-2 px-4 pb-3">
      <AppText textRole="footnote" className="text-foreground-muted">
        {gt("{reason} Switch this thread's mode to continue.", {
          reason: localizeExternalMessage(denial, gt),
        })}
      </AppText>
      {target === undefined || targetLabel === undefined ? null : (
        <Button
          label={gt("Switch to {mode}", { mode: targetLabel })}

          onPress={() => updateComposerDraftSettings(props.threadKey, { runtimeMode: target })}
        />
      )}
    </View>
  );
}
