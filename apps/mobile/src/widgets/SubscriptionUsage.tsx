import { HStack, ProgressView, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import {
  accessibilityElement,
  accessibilityLabel,
  containerBackground,
  environment,
  fixedSize,
  font,
  foregroundStyle,
  frame,
  layoutPriority,
  lineLimit,
  progressViewStyle,
  tint,
  widgetURL,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";

import type { SubscriptionUsageSnapshot as SubscriptionUsageProps } from "./subscriptionUsageSnapshot";

type UsageConfiguration = {
  codexPeriod?: "auto" | "session" | "weekly";
  claudePeriod?: "auto" | "session" | "weekly";
};

function SubscriptionUsage(
  props: SubscriptionUsageProps,
  widgetEnvironment: WidgetEnvironment<UsageConfiguration> & {
    showsContainerBackground?: boolean;
  },
) {
  "widget";
  // The extension evaluates this function without the app's module scope.
  const family = widgetEnvironment.widgetFamily;
  // Gallery snapshots can render an old timeline entry after it has expired.
  const now = Math.max(widgetEnvironment.date?.getTime() ?? 0, Date.now());
  const accessory = family === "accessoryRectangular";
  const compact =
    family === "systemSmall" || accessory || widgetEnvironment.levelOfDetail === "simplified";
  const dense = family === "systemSmall" || family === "systemMedium";
  const limit = family === "systemExtraLarge" ? 6 : family === "systemLarge" ? 4 : 2;
  const monochrome =
    widgetEnvironment.widgetRenderingMode !== "fullColor" || widgetEnvironment.isLuminanceReduced;
  const mode = props.theme?.mode;
  const appearance =
    mode === "light" || mode === "dark"
      ? mode
      : widgetEnvironment.colorScheme === "dark"
        ? "dark"
        : "light";
  // StandBy can remove the card even in full color; text must then follow the host.
  const palette =
    !accessory && !monochrome && widgetEnvironment.showsContainerBackground !== false
      ? props.theme?.[appearance]
      : undefined;
  // The app translates these; an embedded layout with no props yet falls back to English.
  const labels = props.labels;
  const percentLeft = (percent: number) =>
    (labels?.percentLeft ?? "{percent}% left").replace("{percent}", String(percent));
  const windowSummary = (
    name: string,
    window: { label: string; remaining: number; reset: string },
    detail: string,
  ) =>
    (
      labels?.windowSummary ??
      "{provider}, {window}, {percent} percent remaining. {reset}. {detail}."
    )
      .replace("{provider}", name)
      .replace("{window}", window.label)
      .replace("{percent}", String(window.remaining))
      .replace("{reset}", window.reset)
      .replace("{detail}", detail);
  const primary = palette?.foreground ?? "primary";
  const secondary = palette?.secondary ?? "secondary";
  const providers = props.providers ?? [
    { name: "Codex", detail: "Open T3 to connect", windows: [], expiresAt: 0 },
    { name: "Claude", detail: "Open T3 to connect", windows: [], expiresAt: 0 },
  ];
  const columns = providers.map((provider) => {
    const stale = provider.windows.length > 0 && now >= provider.expiresAt;
    const period =
      widgetEnvironment.configuration?.[
        provider.name === "Claude" ? "claudePeriod" : "codexPeriod"
      ] ?? "auto";
    const windows = stale
      ? []
      : provider.windows.filter((window) => period === "auto" || window.kind === period);
    const tightest = windows.reduce<(typeof windows)[number] | undefined>(
      (result, window) => (!result || window.remaining < result.remaining ? window : result),
      undefined,
    );
    const compactWindows = [
      windows.find((window) => window.kind === "session"),
      windows.find((window) => window.kind === "weekly"),
    ].filter((window) => window !== undefined);
    const shown =
      accessory || widgetEnvironment.levelOfDetail === "simplified"
        ? tightest
          ? [tightest]
          : []
        : family === "systemSmall" && compactWindows.length > 0
          ? compactWindows
          : period === "auto" && compactWindows.length > 0
            ? [
                ...compactWindows,
                ...windows.filter((window) => !compactWindows.includes(window)),
              ].slice(0, limit)
            : windows.slice(0, limit);
    const detail = stale
      ? (labels?.openToRefresh ?? "Open T3 to refresh")
      : period !== "auto" && windows.length === 0 && provider.windows.length > 0
        ? period === "session"
          ? (labels?.noSessionLimit ?? "No session limit reported")
          : (labels?.noWeeklyLimit ?? "No weekly limit reported")
        : provider.detail;
    const barModifiers = [
      progressViewStyle("linear"),
      frame({ height: 4 }),
      ...(monochrome ? [] : [tint(provider.name === "Claude" ? "#d97757" : "#8e8e93")]),
    ];
    if (accessory) {
      return (
        <VStack
          key={provider.name}
          alignment="leading"
          spacing={2}
          modifiers={[
            accessibilityElement("ignore"),
            accessibilityLabel(
              tightest
                ? windowSummary(provider.name, tightest, provider.detail)
                : (labels?.providerSummary ?? "{provider}. {detail}.")
                    .replace("{provider}", provider.name)
                    .replace("{detail}", detail),
            ),
          ]}
        >
          <HStack spacing={4}>
            <Text
              modifiers={[
                font({ textStyle: "caption", weight: "semibold" }),
                lineLimit(1),
                foregroundStyle(primary),
              ]}
            >
              {provider.name}
              {tightest ? ` · ${tightest.label}` : ""}
            </Text>
            <Spacer />
            <Text
              modifiers={[
                font({ textStyle: "caption", weight: "semibold" }),
                lineLimit(1),
                layoutPriority(1),
                foregroundStyle(primary),
              ]}
            >
              {tightest
                ? percentLeft(tightest.remaining)
                : period !== "auto" && !stale && provider.windows.length > 0
                  ? (labels?.notAvailable ?? "N/A")
                  : (labels?.open ?? "Open T3")}
            </Text>
          </HStack>
          {tightest ? (
            <ProgressView value={tightest.remaining / 100} modifiers={barModifiers} />
          ) : null}
        </VStack>
      );
    }
    return (
      <VStack
        key={provider.name}
        alignment="leading"
        spacing={dense ? 1 : compact ? 2 : 4}
        modifiers={[
          frame({ maxWidth: Infinity, alignment: "leading" }),
          fixedSize({ horizontal: false, vertical: true }),
        ]}
      >
        <Text
          modifiers={[
            font({ textStyle: compact ? "caption" : "headline", weight: "bold" }),
            lineLimit(1),
            foregroundStyle(primary),
          ]}
        >
          {provider.name}
        </Text>
        {!compact || shown.length === 0 ? (
          <Text
            modifiers={[font({ textStyle: "caption2" }), foregroundStyle(secondary), lineLimit(1)]}
          >
            {detail === (labels?.subscriptionRemaining ?? "Subscription remaining") ? " " : detail}
          </Text>
        ) : null}
        {shown.map((window) => (
          <VStack
            key={window.label}
            alignment="leading"
            spacing={dense ? 1 : 2}
            modifiers={[
              accessibilityElement("ignore"),
              accessibilityLabel(windowSummary(provider.name, window, provider.detail)),
            ]}
          >
            <HStack spacing={4}>
              <Text
                modifiers={[
                  font({ textStyle: compact || dense ? "caption2" : "caption" }),
                  foregroundStyle(secondary),
                  lineLimit(1),
                ]}
              >
                {window.label}
              </Text>
              <Spacer />
              <Text
                modifiers={[
                  font({
                    textStyle: compact || dense ? "caption2" : "caption",
                    weight: "semibold",
                  }),
                  lineLimit(1),
                  layoutPriority(1),
                  foregroundStyle(
                    window.remaining <= 10 && !monochrome
                      ? (palette?.danger ??
                          (widgetEnvironment.colorScheme === "light" ? "#dc2626" : "#fca5a5"))
                      : primary,
                  ),
                ]}
              >
                {percentLeft(window.remaining)}
              </Text>
            </HStack>
            <ProgressView value={window.remaining / 100} modifiers={barModifiers} />
            {!compact ? (
              <Text modifiers={[font({ size: 10 }), foregroundStyle(secondary), lineLimit(1)]}>
                {window.reset}
              </Text>
            ) : null}
          </VStack>
        ))}
        {!compact &&
        !stale &&
        (period === "auto" ? (provider.totalWindows ?? windows.length) : windows.length) > limit ? (
          <Text
            modifiers={[font({ textStyle: "caption2" }), foregroundStyle(secondary), lineLimit(1)]}
          >
            {(labels?.moreInApp ?? "{count} more in T3").replace(
              "{count}",
              String(
                (period === "auto" ? (provider.totalWindows ?? windows.length) : windows.length) -
                  limit,
              ),
            )}
          </Text>
        ) : null}
      </VStack>
    );
  });
  return (
    <VStack
      alignment="leading"
      spacing={accessory || dense ? 2 : 6}
      modifiers={[
        ...(props.url ? [widgetURL(props.url)] : []),
        ...(palette
          ? [
              containerBackground(palette.background, "widget"),
              environment("colorScheme", appearance),
            ]
          : []),
      ]}
    >
      {providers.length === 0 ? (
        <Text modifiers={[font({ textStyle: "caption" }), foregroundStyle(secondary)]}>
          {labels?.noLimits ?? "No subscription limits available."}
        </Text>
      ) : compact ? (
        <VStack alignment="leading" spacing={accessory || dense ? 4 : 8}>
          {columns}
        </VStack>
      ) : (
        <HStack alignment="top" spacing={16}>
          {columns}
        </HStack>
      )}
      {!accessory ? <Spacer /> : null}
      {!accessory ? (
        <Text
          modifiers={[font({ textStyle: "caption2" }), foregroundStyle(secondary), lineLimit(1)]}
        >
          {props.checkedAt
            ? (labels?.asOf ?? "As of {time}").replace(
                "{time}",
                new Date(props.checkedAt).toLocaleString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                  month: "short",
                  day: "numeric",
                }),
              )
            : (labels?.tapToConnect ?? "Tap to connect in T3")}
        </Text>
      ) : null}
    </VStack>
  );
}

export default createWidget("SubscriptionUsage", SubscriptionUsage);
