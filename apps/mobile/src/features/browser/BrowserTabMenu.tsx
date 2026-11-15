import { useGT } from "gt-react-native";
import * as Dialog from "../../components/ui/Dialog";
import { useAtomValue } from "@effect/atom-react";
import type { MenuAction } from "@react-native-menu/menu";
import {
  DEFAULT_PREVIEW_ZOOM_FACTOR,
  type EnvironmentId,
  FILL_PREVIEW_VIEWPORT,
  PREVIEW_ZOOM_LEVELS,
  type PreviewAdjustInput,
  type PreviewSessionSnapshot,
  type PreviewViewportSetting,
} from "@t3tools/contracts";
import { PREVIEW_VIEWPORT_PRESETS } from "@t3tools/shared/previewViewport";

import { ControlPill } from "../../components/ui/ControlPill";
import { Menu } from "../../components/ui/Menu";
import { previewEnvironment } from "../../state/preview";
import { useAtomCommand } from "../../state/use-atom-command";

const APPEARANCES = [{ id: "system" }, { id: "light" }, { id: "dark" }] as const;

const VIEWPORTS = [
  { id: "fill", category: null, label: null, setting: FILL_PREVIEW_VIEWPORT },
  ...(["Phone", "Tablet", "Desktop"] as const).flatMap((category) => {
    const preset = PREVIEW_VIEWPORT_PRESETS.find((candidate) => candidate.category === category);
    if (!preset) return [];
    const setting: PreviewViewportSetting = {
      _tag: "preset",
      presetId: preset.id,
      width: preset.width,
      height: preset.height,
    };
    return [{ id: `preset:${preset.id}`, category, label: preset.label, setting }];
  }),
];

export function BrowserTabMenu({
  environmentId,
  tab,
  streaming,
  onPaste,
}: {
  readonly environmentId: EnvironmentId;
  readonly tab: PreviewSessionSnapshot;
  readonly streaming: boolean;
  readonly onPaste?: () => void;
}) {
  const gt = useGT();
  const appearanceTitle = (id: (typeof APPEARANCES)[number]["id"]) =>
    id === "system" ? gt("System") : id === "light" ? gt("Light") : gt("Dark");
  const viewportTitle = (option: (typeof VIEWPORTS)[number]) => {
    if (option.category === null) return gt("Fit to screen");
    const category =
      option.category === "Phone"
        ? gt("Phone")
        : option.category === "Tablet"
          ? gt("Tablet")
          : gt("Desktop");
    return gt("{category} ({size})", { category, size: option.label });
  };
  const adjust = useAtomCommand(previewEnvironment.adjust, "browser tab change");
  const resize = useAtomCommand(previewEnvironment.resize, "browser viewport change");
  const close = useAtomCommand(previewEnvironment.close, "browser tab close");
  const canClose = useAtomValue(previewEnvironment.close.permissionAtom(environmentId));
  const target = { threadId: tab.threadId as PreviewAdjustInput["threadId"], tabId: tab.tabId };
  const colorScheme = tab.colorScheme ?? "system";
  const zoomFactor = tab.zoomFactor ?? DEFAULT_PREVIEW_ZOOM_FACTOR;
  const zoomIndex = PREVIEW_ZOOM_LEVELS.indexOf(zoomFactor);
  const zoomTo = (step: -1 | 1) =>
    PREVIEW_ZOOM_LEVELS[
      Math.min(Math.max((zoomIndex < 0 ? 7 : zoomIndex) + step, 0), PREVIEW_ZOOM_LEVELS.length - 1)
    ]!;
  const viewportId =
    tab.viewport === undefined || tab.viewport._tag === "fill"
      ? "fill"
      : tab.viewport._tag === "preset"
        ? `preset:${tab.viewport.presetId}`
        : "custom";

  const closeAction: MenuAction = {
    id: "close",
    title: gt("Close tab"),
    image: "xmark",
    attributes: { destructive: true, disabled: !canClose },
  };
  const actions: MenuAction[] = [
    ...(onPaste ? [{ id: "paste", title: gt("Paste"), image: "doc.on.clipboard" }] : []),
    { id: "hard-reload", title: gt("Hard reload"), image: "arrow.clockwise.circle" },
    {
      id: "appearance",
      title: gt("Appearance"),
      image: "circle.lefthalf.filled",
      subactions: APPEARANCES.map((option) => ({
        id: `appearance:${option.id}`,
        title: appearanceTitle(option.id),
        state: option.id === colorScheme ? "on" : "off",
      })),
    },
    {
      id: "zoom",
      title: gt("Zoom ({percent}%)", { percent: Math.round(zoomFactor * 100) }),
      image: "plus.magnifyingglass",
      subactions: [
        { id: "zoom:in", title: gt("Zoom in"), image: "plus.magnifyingglass" },
        { id: "zoom:out", title: gt("Zoom out"), image: "minus.magnifyingglass" },
        { id: "zoom:reset", title: gt("Actual size"), image: "1.magnifyingglass" },
      ],
    },
    {
      id: "viewport",
      title: gt("Viewport"),
      image: "rectangle.and.arrow.up.right.and.arrow.down.left",
      subactions: VIEWPORTS.map((option) => ({
        id: `viewport:${option.id}`,
        title: viewportTitle(option),
        state: option.id === viewportId ? "on" : "off",
      })),
    },
    {
      id: "site-data",
      title: gt("Site data"),
      image: "trash",
      subactions: [
        { id: "clear:cookies", title: gt("Clear cookies"), attributes: { destructive: true } },
        { id: "clear:cache", title: gt("Clear cache"), attributes: { destructive: true } },
      ],
    },
    closeAction,
  ];

  const run = async (change: Omit<PreviewAdjustInput, "threadId" | "tabId">) => {
    const result = await adjust({ environmentId, input: { ...target, ...change } });
    if (result._tag === "Failure") Dialog.alert(gt("Could not change this browser tab"));
  };

  const onAction = (id: string) => {
    if (id === "close") {
      void close({ environmentId, input: target }).then((result) => {
        if (result._tag === "Failure") Dialog.alert(gt("Could not close this browser tab"));
      });
      return;
    }
    if (id === "paste") return onPaste?.();
    if (id === "hard-reload") return void run({ hardReload: true });
    if (id === "zoom:in") return void run({ zoomFactor: zoomTo(1) });
    if (id === "zoom:out") return void run({ zoomFactor: zoomTo(-1) });
    if (id === "zoom:reset") return void run({ zoomFactor: DEFAULT_PREVIEW_ZOOM_FACTOR });
    if (id === "clear:cookies") return void run({ clear: "cookies" });
    if (id === "clear:cache") return void run({ clear: "cache" });
    if (id.startsWith("appearance:")) {
      const option = APPEARANCES.find((candidate) => `appearance:${candidate.id}` === id);
      if (option) void run({ colorScheme: option.id });
      return;
    }
    if (id.startsWith("viewport:")) {
      const option = VIEWPORTS.find((candidate) => `viewport:${candidate.id}` === id);
      if (!option) return;
      void resize({ environmentId, input: { ...target, viewport: option.setting } }).then(
        (result) => {
          if (result._tag === "Failure") Dialog.alert(gt("Could not change the viewport"));
        },
      );
    }
  };

  return (
    <Menu
      // Remount when streaming changes, so an open menu never keeps offering
      // the other state's actions.
      key={streaming ? "streaming" : "idle"}
      accessible
      accessibilityLabel={gt("Browser tab options")}
      accessibilityRole="button"
      actions={streaming ? actions : [closeAction]}
      onPressAction={({ nativeEvent }) => onAction(nativeEvent.event)}
    >
      <ControlPill icon="ellipsis" accessibilityLabel={gt("Browser tab options")} />
    </Menu>
  );
}
