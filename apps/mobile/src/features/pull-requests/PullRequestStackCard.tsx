import { StackActions, useNavigation } from "@react-navigation/native";
import { useGT } from "gt-react-native";
import { useState } from "react";
import { View } from "react-native";
import { AppText as Text } from "../../components/ui/AppText";
import { PullRequestCardGroup, PullRequestCardRow } from "./PullRequestControls";
import { pullRequestLayerParams } from "./pullRequestStack";
import { pullRequestStatus, pullRequestStatusLabel } from "./pullRequestStatus";
import type { PullRequestParams } from "./usePullRequestDiff";
import type { PullRequestStackState } from "./usePullRequestStack";
import { PullRequestGlyph } from "./pullRequestGlyphs";
import { withKnownPullRequestSummary } from "../../state/use-thread-pr";

export function PullRequestStackCard(props: {
  readonly params: PullRequestParams;
  readonly state: PullRequestStackState;
}) {
  const gt = useGT();
  const navigation = useNavigation();
  const [expanded, setExpanded] = useState(false);
  const stack = props.state.stack;
  if (!stack) {
    const summary =
      props.params.initialSummary?.number === props.params.number
        ? props.params.initialSummary.stack
        : undefined;
    if (!summary) return null;
    return (
      <PullRequestCardGroup>
        <PullRequestCardRow
          title={gt("Stack")}
          icon={PullRequestGlyph.stack}
          value={gt("{position} of {count}", { position: summary.position, count: summary.size })}
          last
        />
      </PullRequestCardGroup>
    );
  }
  const position = stack.layers.findIndex((layer) => layer.number === props.params.number) + 1;
  return (
    <PullRequestCardGroup>
      <PullRequestCardRow
        title={gt("Stack")}
        icon={PullRequestGlyph.stack}
        value={gt("{position} of {count}", { position, count: stack.layers.length })}
        accessibilityLabel={
          props.state.isFresh
            ? gt("Stack, {position} of {count}", { position, count: stack.layers.length })
            : gt("Stack, {position} of {count}, showing saved stack", {
                position,
                count: stack.layers.length,
              })
        }
        expanded={expanded}
        onPress={() => setExpanded(!expanded)}
        last={!expanded}
      />
      {expanded ? (
        <View>
          {stack.layers.map((layer, index) => {
            const selected = layer.number === props.params.number;
            const status = pullRequestStatus({
              state: layer.state,
              isDraft: layer.isDraft === true,
            });
            return (
              <View key={layer.number} className={selected ? "bg-thread-selected" : undefined}>
                <PullRequestCardRow
                  title={layer.title ?? layer.headBranch}
                  icon={status.icon}
                  tint={status.tint}
                  value={
                    selected
                      ? gt("Current")
                      : pullRequestStatusLabel(
                          { state: layer.state, isDraft: layer.isDraft === true },
                          gt,
                        )
                  }
                  detail={`#${layer.number} · ${gt("{position} of {count}", {
                    position: index + 1,
                    count: stack.layers.length,
                  })}`}
                  onPress={
                    selected
                      ? undefined
                      : () =>
                          navigation.dispatch(
                            StackActions.push(
                              "PullRequest",
                              withKnownPullRequestSummary(
                                pullRequestLayerParams(props.params, layer.number),
                              ),
                            ),
                          )
                  }
                  last={index === stack.layers.length - 1}
                />
              </View>
            );
          })}
          <Text className="px-4 py-3 text-xs text-foreground-muted">
            {gt("Base: {base}. Open a layer to review it or merge the stack through that layer.", {
              base: stack.base,
            })}
          </Text>
        </View>
      ) : null}
    </PullRequestCardGroup>
  );
}
