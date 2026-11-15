import { useAtomValue } from "@effect/atom-react";
import {
  AVAILABLE_CONNECTION_STATE,
  type ConnectionDiagnosis,
  connectionDiagnosisText,
  connectionRoutes,
  hasRelayRoute,
  presentConnectionDiagnosis,
  type EnvironmentPresentation,
} from "@t3tools/client-runtime/connection";
import type { EnvironmentId } from "@t3tools/contracts";
import Constants from "expo-constants";
import { AsyncResult } from "effect/reactivity";
import { Linking, View } from "react-native";

import { AppText as Text } from "../../components/ui/AppText";
import { Button } from "../../components/ui/Button";
import { environmentCatalog } from "../../connection/catalog";
import { cn } from "../../lib/cn";
import { copyTextWithHaptic } from "../../lib/copyTextWithHaptic";
import "../../i18n/intl-polyfills";
import { useGT } from "gt-react-native";
import { localizeExternalMessage, type Translate } from "../../i18n/externalMessages";

const HOP_MARK = { ok: "✓", failed: "✕", unchecked: "–" } as const;

/** The package labels a hop "This device", "T3 Connect", "<host> tunnel" or "T3 Code on <host>". */
function hopLabel(hop: ConnectionDiagnosis["hops"][number], gt: Translate) {
  switch (hop.hop) {
    case "device":
      return gt("This device");
    case "relay":
      return hop.label;
    case "tunnel":
      return hop.label.endsWith(" tunnel")
        ? gt("{host} tunnel", { host: hop.label.slice(0, -" tunnel".length) })
        : hop.label;
    case "server":
      return hop.label.startsWith("T3 Code on ")
        ? gt("T3 Code on {host}", { host: hop.label.slice("T3 Code on ".length) })
        : hop.label;
  }
}

/** Same model as the web Settings row; null while connected, off, or not failed. */
export function useConnectionDiagnosis(
  environmentId: EnvironmentId,
  presentation: EnvironmentPresentation | null,
) {
  const state = AsyncResult.getOrElse(
    useAtomValue(environmentCatalog.stateAtom(environmentId)),
    () => AVAILABLE_CONNECTION_STATE,
  );
  if (presentation === null || !presentation.entry.enabled) return { diagnosis: null, state };
  const phase = presentation.connection.phase;
  if (phase === "connected" || phase === "unsupported") return { diagnosis: null, state };
  const relayOnly =
    connectionRoutes(presentation.entry).length === 1 && hasRelayRoute(presentation.entry);
  const diagnosis = presentConnectionDiagnosis({
    hostLabel: presentation.entry.target.label,
    state,
    via: relayOnly ? "relay" : "direct",
    clientVersion: Constants.expoConfig?.version,
    serverVersion: presentation.serverConfig?.environment.serverVersion,
  });
  return { diagnosis, state };
}

export function ConnectionDiagnosisDetails(props: {
  readonly hostLabel: string;
  readonly diagnosis: ConnectionDiagnosis;
}) {
  const gt = useGT();
  const { diagnosis } = props;
  const { moreInfoUrl } = diagnosis;
  return (
    <View className="gap-3">
      <View className="gap-0.5">
        {diagnosis.hops.map((hop) => (
          <Text
            key={hop.hop}
            className={cn(
              "text-sm",
              hop.result === "failed" ? "text-danger-foreground" : "text-foreground-muted",
            )}
          >
            {`${HOP_MARK[hop.result]}  ${hopLabel(hop, gt)}${
              hop.result === "failed"
                ? ` · ${gt("Failed")}`
                : hop.result === "unchecked"
                  ? ` · ${gt("Not checked")}`
                  : ""
            }`}
          </Text>
        ))}
      </View>
      <View className="gap-0.5">
        <Text className="text-sm font-t3-bold text-foreground">{gt("What to try")}</Text>
        {diagnosis.steps.map((step, index) => (
          <Text key={step} className="text-sm text-foreground-muted">
            {`${index + 1}. ${localizeExternalMessage(step, gt)}`}
          </Text>
        ))}
      </View>
      <Text selectable className="font-mono text-xs text-foreground-muted">
        {diagnosis.facts
          .map(([label, value]) => `${localizeExternalMessage(label, gt)}: ${value}`)
          .join("\n")}
      </Text>
      <Button
        label={gt("Copy diagnostics")}
        icon="doc.on.doc"
        onPress={() => {
          copyTextWithHaptic(connectionDiagnosisText(props.hostLabel, diagnosis), {
            target: "connection-diagnostics",
          });
        }}
      />
      {moreInfoUrl ? (
        <Button
          label={gt("More info")}
          icon="safari"
          tone="secondary"
          onPress={() => void Linking.openURL(moreInfoUrl).catch(() => undefined)}
        />
      ) : null}
    </View>
  );
}
