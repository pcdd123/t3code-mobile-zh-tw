import { useGT } from "gt-react-native";
import { Button } from "../../components/ui/Button";
import { AppActivityIndicator } from "../../components/ui/AppActivityIndicator";
import { ConnectionTraceId } from "./ConnectionTraceId";
import {
  type EnvironmentConnectionPhase,
  type EnvironmentConnectionPresentation,
} from "@t3tools/client-runtime/connection";
import { SymbolView } from "../../components/ui/AppSymbol";
import { View } from "react-native";

import { AppText as Text } from "../../components/ui/AppText";

type Translate = ReturnType<typeof useGT>;

function noticeTitle(
  phase: EnvironmentConnectionPhase,
  environmentLabel: string,
  awaitingApproval: boolean,
  gt: Translate,
): string {
  const environment = environmentLabel;
  if (awaitingApproval)
    return gt("Waiting for {environment} to approve this device", { environment });
  switch (phase) {
    case "offline":
      return gt("You are offline");
    case "connecting":
      return gt("Connecting to {environment}...", { environment });
    case "reconnecting":
      return gt("Reconnecting to {environment}...", { environment });
    case "unsupported":
      return gt("Client not supported");
    case "error":
      return gt("{environment} is unavailable", { environment });
    case "available":
      return gt("{environment} is disconnected", { environment });
    case "connected":
      return "";
  }
}

// Callers pass an English resource id; known ones are translated for the sentence.
function resourceLabel(resourceName: string, gt: Translate): string {
  if (resourceName === "preview") return gt("preview");
  if (resourceName === "review") return gt("review");
  if (resourceName === "terminal") return gt("terminal");
  return resourceName;
}

function noticeDetail(
  phase: EnvironmentConnectionPhase,
  resourceName: string,
  error: string | null,
  awaitingApproval: boolean,
  gt: Translate,
): string {
  if (error && awaitingApproval) return error;
  if (error) {
    return phase === "reconnecting"
      ? gt("The app will keep retrying automatically. {error}", { error })
      : error;
  }
  const resource = resourceLabel(resourceName, gt);

  switch (phase) {
    case "offline":
      return gt(
        "Cached data remains available. The {resource} will load when your connection returns.",
        { resource },
      );
    case "connecting":
    case "reconnecting":
      return gt("The {resource} will load as soon as the environment is ready.", { resource });
    case "unsupported":
      return gt("Use compatible versions of the app and server to connect.");
    case "available":
    case "error":
      return gt("Reconnect the environment to load the {resource}.", { resource });
    case "connected":
      return "";
  }
}

export function EnvironmentConnectionNotice(props: {
  readonly environmentLabel: string;
  readonly connection: EnvironmentConnectionPresentation;
  readonly resourceName: string;
  readonly onRetry: () => void;
}) {
  const gt = useGT();
  const isRetrying =
    props.connection.phase === "connecting" || props.connection.phase === "reconnecting";

  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="max-w-[320px] items-center gap-3">
        {isRetrying ? (
          <AppActivityIndicator size="small" colorClassName={"accent-icon-muted"} />
        ) : (
          <SymbolView
            name={props.connection.phase === "offline" ? "wifi.slash" : "bolt.horizontal.circle"}
            size={24}
            tintColorClassName={"accent-icon-muted"}
            type="monochrome"
          />
        )}

        <Text className="text-center text-lg font-t3-bold text-foreground">
          {noticeTitle(
            props.connection.phase,
            props.environmentLabel,
            props.connection.awaitingApproval === true,
            gt,
          )}
        </Text>
        <Text className="text-center text-sm leading-normal text-foreground-muted">
          {noticeDetail(
            props.connection.phase,
            props.resourceName,
            props.connection.error,
            props.connection.awaitingApproval === true,
            gt,
          )}
          {props.connection.traceId ? (
            <ConnectionTraceId traceId={props.connection.traceId} />
          ) : null}
        </Text>

        {props.connection.phase !== "offline" && props.connection.phase !== "unsupported" ? (
          <View className="mt-1">
            <Button label={gt("Retry now")} tone="secondary" onPress={props.onRetry} />
          </View>
        ) : null}
      </View>
    </View>
  );
}
