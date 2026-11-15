import {
  STATIC_KEYBINDING_COMMANDS,
  type KeybindingCommand,
  type KeybindingShortcut,
  type KeybindingWhenNode,
  type ResolvedKeybindingRule,
  type ResolvedKeybindingsConfig,
} from "@t3tools/contracts";
import {
  DEFAULT_RESOLVED_KEYBINDINGS,
  parseKeybindingShortcut,
  parseKeybindingWhenExpression,
  US_SHIFTED_TO_UNSHIFTED_KEYS,
} from "@t3tools/shared/keybindings";
import type { useGT } from "gt-react";

import { shortcutConflictKey, shortcutKeyFromEvent } from "../../keybindings";
import { isMacPlatform } from "../../lib/utils";
import { METRIC_OPTIONS, WINDOW_OPTIONS } from "../usage/usageShortcuts";

type Translate = ReturnType<typeof useGT>;

// Rank every usage command; mixing rank and alphabetical comparisons makes order input-dependent.
const usageCommandOrder = new Map<KeybindingCommand, number>(
  [
    "usage.open" as const,
    ...[...METRIC_OPTIONS, ...WINDOW_OPTIONS].map((option) => option.command),
  ].map((command, index) => [command, index]),
);

const firstUsageCommand = METRIC_OPTIONS[0].command;

function compareCommands(
  left: KeybindingCommand,
  right: KeybindingCommand,
  key: (command: KeybindingCommand) => string,
): number {
  const leftRank = usageCommandOrder.get(left);
  const rightRank = usageCommandOrder.get(right);
  if (leftRank !== undefined && rightRank !== undefined) return leftRank - rightRank;
  return key(leftRank === undefined ? left : firstUsageCommand).localeCompare(
    key(rightRank === undefined ? right : firstUsageCommand),
  );
}

export type KeybindingSource = "Default" | "Custom" | "Project";

export interface KeybindingRow {
  readonly id: string;
  readonly command: KeybindingCommand;
  readonly key: string;
  readonly when: string;
  readonly source: KeybindingSource;
  readonly defaultKey: string | null;
  readonly defaultWhen: string;
  readonly binding: ResolvedKeybindingRule;
  readonly conflicts: ReadonlyArray<string>;
}

export type WhenVariableOption = string;
export type KeybindingCommandOption = KeybindingCommand;

const CORE_WHEN_VARIABLES = [
  "terminalFocus",
  "terminalOpen",
  "previewOpen",
  "isWeb",
  "isDesktop",
  "true",
  "false",
] as const;

const DEFAULT_WHEN_VARIABLES = new Set<string>(CORE_WHEN_VARIABLES);
for (const binding of DEFAULT_RESOLVED_KEYBINDINGS) {
  collectWhenIdentifiersFromNode(binding.whenAst, DEFAULT_WHEN_VARIABLES);
}

export const DEFAULT_WHEN_VARIABLE =
  [...DEFAULT_WHEN_VARIABLES].find(
    (identifier) => identifier !== "true" && identifier !== "false",
  ) ?? "terminalFocus";
const KNOWN_WHEN_VARIABLES = new Set(DEFAULT_WHEN_VARIABLES);

export function shortcutToKeybindingInput(shortcut: KeybindingShortcut): string {
  const parts: string[] = [];
  if (shortcut.modKey) parts.push("mod");
  if (shortcut.metaKey) parts.push("meta");
  if (shortcut.ctrlKey) parts.push("ctrl");
  if (shortcut.altKey) parts.push("alt");
  if (shortcut.shiftKey) parts.push("shift");
  parts.push(shortcut.key === " " ? "space" : shortcut.key === "escape" ? "esc" : shortcut.key);
  return parts.join("+");
}

export function whenAstToExpression(node: KeybindingWhenNode | undefined): string {
  if (!node) return "";
  switch (node.type) {
    case "identifier":
      return node.name;
    case "not":
      return `!${wrapWhenExpression(node.node)}`;
    case "and":
      return `${wrapWhenExpression(node.left)} && ${wrapWhenExpression(node.right)}`;
    case "or":
      return `${wrapWhenExpression(node.left)} || ${wrapWhenExpression(node.right)}`;
  }
}

export function whenNodeRemoveLabel(
  node: KeybindingWhenNode,
  depth: number,
  gt: Translate,
): string {
  if (depth === 0) return gt("Clear all conditions");
  if (node.type === "identifier" || (node.type === "not" && node.node.type === "identifier")) {
    return gt("Remove condition");
  }
  return gt("Remove group and its conditions");
}

function wrapWhenExpression(node: KeybindingWhenNode): string {
  if (node.type === "identifier" || node.type === "not") return whenAstToExpression(node);
  return `(${whenAstToExpression(node)})`;
}

export function parseWhenExpressionDraft(
  expression: string,
): { ok: true; value: KeybindingWhenNode | undefined } | { ok: false; message: string } {
  const trimmed = expression.trim();
  if (trimmed.length === 0) return { ok: true, value: undefined };

  const ast = parseKeybindingWhenExpression(trimmed);
  if (!ast) {
    return {
      ok: false,
      message: "Use variables with !, &&, ||, and parentheses.",
    };
  }

  return { ok: true, value: ast };
}

function sourceForBinding(binding: ResolvedKeybindingRule): KeybindingSource {
  if (String(binding.command).startsWith("script.")) {
    return "Project";
  }

  const bindingKey = shortcutToKeybindingInput(binding.shortcut);
  const bindingWhen = whenAstToExpression(binding.whenAst);
  const isDefault = DEFAULT_RESOLVED_KEYBINDINGS.some(
    (entry) =>
      entry.command === binding.command &&
      shortcutToKeybindingInput(entry.shortcut) === bindingKey &&
      whenAstToExpression(entry.whenAst) === bindingWhen,
  );

  return isDefault ? "Default" : "Custom";
}

function defaultBindingForBinding(
  binding: ResolvedKeybindingRule,
): ResolvedKeybindingRule | undefined {
  const bindingKey = shortcutToKeybindingInput(binding.shortcut);
  const bindingWhen = whenAstToExpression(binding.whenAst);

  return (
    DEFAULT_RESOLVED_KEYBINDINGS.find(
      (entry) =>
        entry.command === binding.command &&
        shortcutToKeybindingInput(entry.shortcut) === bindingKey &&
        whenAstToExpression(entry.whenAst) === bindingWhen,
    ) ??
    DEFAULT_RESOLVED_KEYBINDINGS.find(
      (entry) =>
        entry.command === binding.command && whenAstToExpression(entry.whenAst) === bindingWhen,
    ) ??
    DEFAULT_RESOLVED_KEYBINDINGS.find((entry) => entry.command === binding.command)
  );
}

function keybindingRowId(command: KeybindingCommand, key: string, when: string): string {
  return `${command}\u0000${key}\u0000${when}`;
}

function conflictsWithWhen(leftWhen: string, rightWhen: string): boolean {
  return leftWhen.length === 0 || rightWhen.length === 0 || leftWhen === rightWhen;
}

export function keybindingConflictLabels(
  rows: ReadonlyArray<KeybindingRow>,
  input: {
    readonly rowId: string;
    readonly key: string;
    readonly when: string;
    readonly labelFor?: (command: KeybindingCommand) => string;
  },
  platform = navigator.platform,
): ReadonlyArray<string> {
  const labelFor = input.labelFor ?? commandLabel;
  if (input.key.trim().length === 0) return [];
  const shortcut = parseKeybindingShortcut(input.key);
  if (!shortcut) return [];
  // Compare resolved chords so mod+k and ctrl+k collide where mod is Ctrl.
  const conflictKey = shortcutConflictKey(shortcut, platform);
  const conflicts: Array<string> = [];
  for (const candidate of rows) {
    if (
      candidate.id !== input.rowId &&
      shortcutConflictKey(candidate.binding.shortcut, platform) === conflictKey &&
      conflictsWithWhen(candidate.when, input.when)
    ) {
      conflicts.push(labelFor(candidate.command));
    }
  }
  return [...new Set(conflicts)].toSorted();
}

export interface KeybindingGroup {
  readonly id: string;
  readonly title: string;
  readonly rows: ReadonlyArray<KeybindingRow>;
}

const KEYBINDING_GROUPS = [
  {
    id: "navigation",
    title: "Navigation",
    prefixes: ["sidebar", "rightPanel", "commandPalette", "filePicker", "projectSearch", "editor"],
  },
  { id: "threads", title: "Threads", prefixes: ["thread", "chat", "pullRequest"] },
  { id: "composer", title: "Composer", prefixes: ["composer", "modelPicker"] },
  { id: "terminal", title: "Terminal", prefixes: ["terminal"] },
  { id: "preview", title: "Preview & diff", prefixes: ["preview", "diff"] },
  { id: "appearance", title: "Appearance", prefixes: ["theme", "appearance", "themeEditor"] },
  { id: "scripts", title: "Project scripts", prefixes: ["script"] },
] as const;
const OTHER_KEYBINDING_GROUP = { id: "other", title: "Other" } as const;

export function localizedKeybindingGroupTitle(group: KeybindingGroup, gt: Translate): string {
  switch (group.id) {
    case "navigation":
      return gt("Navigation");
    case "threads":
      return gt("Threads");
    case "composer":
      return gt("Composer");
    case "terminal":
      return gt("Terminal");
    case "preview":
      return gt("Preview & diff");
    case "appearance":
      return gt("Appearance");
    case "scripts":
      return gt("Project scripts");
    case "other":
      return gt("Other");
    default:
      return group.title;
  }
}

function keybindingGroupFor(command: KeybindingCommand): { id: string; title: string } {
  const prefix = String(command).split(".")[0] ?? "";
  return (
    KEYBINDING_GROUPS.find((group) => (group.prefixes as ReadonlyArray<string>).includes(prefix)) ??
    OTHER_KEYBINDING_GROUP
  );
}

export function groupKeybindingRows(
  rows: ReadonlyArray<KeybindingRow>,
): ReadonlyArray<KeybindingGroup> {
  const rowsByGroup = new Map<string, Array<KeybindingRow>>();
  for (const row of rows) {
    const group = keybindingGroupFor(row.command);
    const bucket = rowsByGroup.get(group.id);
    if (bucket) bucket.push(row);
    else rowsByGroup.set(group.id, [row]);
  }
  return [...KEYBINDING_GROUPS, OTHER_KEYBINDING_GROUP].flatMap((group) => {
    const groupRows = rowsByGroup.get(group.id);
    return groupRows ? [{ id: group.id, title: group.title, rows: groupRows }] : [];
  });
}

export function buildKeybindingRows(
  keybindings: ResolvedKeybindingsConfig,
  platform = navigator.platform,
): ReadonlyArray<KeybindingRow> {
  const rowsById = new Map<string, KeybindingRow>();
  for (const binding of keybindings) {
    const defaultBinding = defaultBindingForBinding(binding);
    const key = shortcutToKeybindingInput(binding.shortcut);
    const when = whenAstToExpression(binding.whenAst);
    const id = keybindingRowId(binding.command, key, when);
    rowsById.set(id, {
      id,
      command: binding.command,
      key,
      when,
      source: sourceForBinding(binding),
      defaultKey: defaultBinding ? shortcutToKeybindingInput(defaultBinding.shortcut) : null,
      defaultWhen: whenAstToExpression(defaultBinding?.whenAst),
      binding,
      conflicts: [],
    });
  }
  const rows = [...rowsById.values()];

  const rowsWithConflicts = rows.map((row) => {
    const conflicts = keybindingConflictLabels(
      rows,
      {
        rowId: row.id,
        key: row.key,
        when: row.when,
      },
      platform,
    );
    return conflicts.length > 0
      ? Object.assign({}, row, { conflicts: [...new Set(conflicts)].toSorted() })
      : row;
  });

  rowsWithConflicts.sort((left, right) => {
    const commandCompare = compareCommands(left.command, right.command, (command) => command);
    if (commandCompare !== 0) return commandCompare;
    return left.key.localeCompare(right.key);
  });

  return rowsWithConflicts;
}

export function filterKeybindingRows(
  rows: ReadonlyArray<KeybindingRow>,
  query: string,
  labelFor?: (command: KeybindingCommand) => string,
): ReadonlyArray<KeybindingRow> {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length === 0) return rows;
  return rows.filter((row) => {
    return (
      row.command.toLowerCase().includes(normalizedQuery) ||
      commandLabel(row.command).toLowerCase().includes(normalizedQuery) ||
      (labelFor?.(row.command).toLowerCase().includes(normalizedQuery) ?? false) ||
      row.key.toLowerCase().includes(normalizedQuery) ||
      row.when.toLowerCase().includes(normalizedQuery) ||
      row.source.toLowerCase().includes(normalizedQuery)
    );
  });
}

function collectWhenIdentifiersFromNode(
  node: KeybindingWhenNode | undefined,
  identifiers: Set<string>,
): void {
  if (!node) return;
  switch (node.type) {
    case "identifier":
      identifiers.add(node.name);
      return;
    case "not":
      collectWhenIdentifiersFromNode(node.node, identifiers);
      return;
    case "and":
    case "or":
      collectWhenIdentifiersFromNode(node.left, identifiers);
      collectWhenIdentifiersFromNode(node.right, identifiers);
      return;
  }
}

export function isKnownWhenVariable(identifier: string): boolean {
  return KNOWN_WHEN_VARIABLES.has(identifier);
}

export function unknownWhenVariables(node: KeybindingWhenNode | undefined): ReadonlyArray<string> {
  const identifiers = new Set<string>();
  collectWhenIdentifiersFromNode(node, identifiers);
  return [...identifiers].filter((identifier) => !isKnownWhenVariable(identifier)).toSorted();
}

export function buildWhenVariableOptions(): ReadonlyArray<WhenVariableOption> {
  return [...KNOWN_WHEN_VARIABLES].toSorted((left, right) => {
    const leftCoreIndex = CORE_WHEN_VARIABLES.indexOf(left as (typeof CORE_WHEN_VARIABLES)[number]);
    const rightCoreIndex = CORE_WHEN_VARIABLES.indexOf(
      right as (typeof CORE_WHEN_VARIABLES)[number],
    );
    if (leftCoreIndex !== -1 || rightCoreIndex !== -1) {
      return (
        (leftCoreIndex === -1 ? Number.MAX_SAFE_INTEGER : leftCoreIndex) -
        (rightCoreIndex === -1 ? Number.MAX_SAFE_INTEGER : rightCoreIndex)
      );
    }
    return left.localeCompare(right);
  });
}

export function buildKeybindingCommandOptions(
  keybindings: ResolvedKeybindingsConfig,
): ReadonlyArray<KeybindingCommandOption> {
  const commands = new Set<KeybindingCommand>(STATIC_KEYBINDING_COMMANDS);
  for (const binding of keybindings) {
    commands.add(binding.command);
  }
  return [...commands].toSorted((left, right) => compareCommands(left, right, commandLabel));
}

export function commandLabel(command: KeybindingCommand): string {
  if (command === "workspace.focusNext") return "Focus Next Workspace Area";
  if (command === "workspace.focusPrevious") return "Focus Previous Workspace Area";
  if (command === "composer.sendAlternate") return "Composer: Opposite Queue or Steer Action";
  if (command === "composer.sendBackground") return "Composer: Start in Background";
  if (command === "composer.sendAndNewThread") return "Composer: Send and Start New Thread";
  if (command === "composer.dictation") return "Composer: Start or Finish Dictation";
  if (command === "thread.steerQueuedMessage") return "Queue: Send First Queued Message";
  if (command === "thread.editQueuedMessage") return "Queue: Edit Last Queued Message";
  if (command === "thread.copyReference") return "Pull Request: Copy Link or Thread";
  const usageMetric = METRIC_OPTIONS.find((option) => option.command === command);
  if (usageMetric) return `Usage: ${usageMetric.label}`;
  const usagePeriod = WINDOW_OPTIONS.find((option) => option.command === command);
  if (usagePeriod) return `Usage: Period: ${usagePeriod.label}`;
  if (command === "view.reopenClosed") return "Reopen Closed Tab";
  if (command === "preview.focusUrl") return "Preview: Focus URL";
  if (command === "preview.find") return "Preview: Find on Page";
  const raw = String(command);
  if (raw.startsWith("script.") && raw.endsWith(".run")) {
    return `Run Script: ${titleCaseCommandSegment(raw.slice("script.".length, -".run".length))}`;
  }
  return raw.split(".").map(titleCaseCommandSegment).join(": ");
}

/** The label shown to the viewer; `commandLabel` stays English for sorting, ids and search. */
export function localizedCommandLabel(command: KeybindingCommand, gt: Translate): string {
  const raw = String(command);
  const threadJump = /^thread\.jump\.(\d)$/.exec(raw);
  if (threadJump) return gt("Thread: Jump: {number}", { number: threadJump[1] });
  const modelPickerJump = /^modelPicker\.jump\.(\d)$/.exec(raw);
  if (modelPickerJump) return gt("Model Picker: Jump: {number}", { number: modelPickerJump[1] });
  if (raw.startsWith("script.") && raw.endsWith(".run")) {
    return gt("Run Script: {name}", {
      name: titleCaseCommandSegment(raw.slice("script.".length, -".run".length)),
    });
  }
  switch (raw) {
    case "workspace.focusNext":
      return gt("Focus Next Workspace Area");
    case "workspace.focusPrevious":
      return gt("Focus Previous Workspace Area");
    case "sidebar.toggle":
      return gt("Sidebar: Toggle");
    case "navigation.back":
      return gt("Navigation: Back");
    case "navigation.forward":
      return gt("Navigation: Forward");
    case "terminal.toggle":
      return gt("Terminal: Toggle");
    case "terminal.split":
      return gt("Terminal: Split");
    case "terminal.splitVertical":
      return gt("Terminal: Split Vertical");
    case "terminal.new":
      return gt("Terminal: New");
    case "terminal.close":
      return gt("Terminal: Close");
    case "rightPanel.toggle":
      return gt("Right Panel: Toggle");
    case "rightPanel.new":
      return gt("Right Panel: New");
    case "threadPanel.toggle":
      return gt("Thread Panel: Toggle");
    case "rightPanel.toggleMaximized":
      return gt("Right Panel: Toggle Maximized");
    case "rightPanel.close":
      return gt("Right Panel: Close");
    case "view.reopenClosed":
      return gt("Reopen Closed Tab");
    case "pullRequest.copyNumber":
      return gt("Pull Request: Copy Number");
    case "diff.toggle":
      return gt("Diff: Toggle");
    case "preview.toggle":
      return gt("Preview: Toggle");
    case "preview.refresh":
      return gt("Preview: Refresh");
    case "preview.focusUrl":
      return gt("Preview: Focus URL");
    case "preview.zoomIn":
      return gt("Preview: Zoom In");
    case "preview.zoomOut":
      return gt("Preview: Zoom Out");
    case "preview.resetZoom":
      return gt("Preview: Reset Zoom");
    case "preview.find":
      return gt("Preview: Find on Page");
    case "commandPalette.toggle":
      return gt("Command Palette: Toggle");
    case "filePicker.toggle":
      return gt("File Picker: Toggle");
    case "projectSearch.toggle":
      return gt("Project Search: Toggle");
    case "usage.open":
      return gt("Usage: Open");
    case "theme.select":
      return gt("Theme: Select");
    case "appearance.cycle":
      return gt("Appearance: Cycle");
    case "themeEditor.toggle":
      return gt("Theme Editor: Toggle");
    case "composer.stash":
      return gt("Composer: Stash");
    case "composer.sendAlternate":
      return gt("Composer: Opposite Queue or Steer Action");
    case "composer.sendBackground":
      return gt("Composer: Start in Background");
    case "composer.sendAndNewThread":
      return gt("Composer: Send and Start New Thread");
    case "composer.dictation":
      return gt("Composer: Start or Finish Dictation");
    case "composer.host":
      return gt("Composer: Host");
    case "composer.cycleHost":
      return gt("Composer: Cycle Host");
    case "composer.effort":
      return gt("Composer: Effort");
    case "composer.increaseEffort":
      return gt("Composer: Increase Effort");
    case "composer.decreaseEffort":
      return gt("Composer: Decrease Effort");
    case "composer.mode":
      return gt("Composer: Mode");
    case "composer.workspace":
      return gt("Composer: Workspace");
    case "composer.previousWorktree":
      return gt("Composer: Previous Worktree");
    case "composer.branch":
      return gt("Composer: Branch");
    case "chat.new":
      return gt("Chat: New");
    case "chat.newLocal":
      return gt("Chat: New Local");
    case "chat.newWithoutProject":
      return gt("Chat: New Without Project");
    case "chat.find":
      return gt("Chat: Find");
    case "editor.openFavorite":
      return gt("Editor: Open Favorite");
    case "usage.cost":
      return gt("Usage: Cost");
    case "usage.tokens":
      return gt("Usage: Tokens");
    case "usage.limits":
      return gt("Usage: Limits");
    case "usage.period.day":
      return gt("Usage: Period: Past 24h");
    case "usage.period.week":
      return gt("Usage: Period: 7 days");
    case "usage.period.month":
      return gt("Usage: Period: 30 days");
    case "usage.period.quarter":
      return gt("Usage: Period: 90 days");
    case "modelPicker.toggle":
      return gt("Model Picker: Toggle");
    case "modelPicker.previousProvider":
      return gt("Model Picker: Previous Provider");
    case "modelPicker.nextProvider":
      return gt("Model Picker: Next Provider");
    case "thread.stop":
      return gt("Thread: Stop");
    case "thread.steerQueuedMessage":
      return gt("Queue: Send First Queued Message");
    case "thread.editQueuedMessage":
      return gt("Queue: Edit Last Queued Message");
    case "thread.previous":
      return gt("Thread: Previous");
    case "thread.next":
      return gt("Thread: Next");
    case "thread.copyReference":
      return gt("Pull Request: Copy Link or Thread");
    case "thread.settle":
      return gt("Thread: Settle");
    case "thread.pin":
      return gt("Thread: Pin");
    case "thread.regenerateTitle":
      return gt("Thread: Regenerate Title");
    case "thread.undo":
      return gt("Thread: Undo");
    default:
      return commandLabel(command);
  }
}

function titleCaseCommandSegment(segment: string): string {
  const words: Array<string> = [];
  for (const part of segment.replace(/([a-z0-9])([A-Z])/g, "$1 $2").split(/[-_\s]+/)) {
    if (part.length > 0) {
      words.push(part.slice(0, 1).toUpperCase() + part.slice(1));
    }
  }
  return words.join(" ");
}

function recordedLayoutShortcutKey(
  event: Pick<KeyboardEvent, "key" | "code" | "shiftKey" | "altKey">,
): string {
  const physicalKey = shortcutKeyFromEvent(event);
  const layoutKey = event.key.toLowerCase();
  if (event.altKey || layoutKey.length !== 1) return physicalKey;
  // Normalize only US shifted glyphs at their US position. Other layouts can
  // produce the same glyph without Shift or at a different position.
  const unshiftedKey = event.shiftKey ? US_SHIFTED_TO_UNSHIFTED_KEYS.get(layoutKey) : undefined;
  return unshiftedKey === physicalKey ? physicalKey : layoutKey;
}

function normalizeShortcutKeyToken(key: string): string | null {
  const normalized = key.toLowerCase();
  if (
    normalized === "meta" ||
    normalized === "control" ||
    normalized === "ctrl" ||
    normalized === "shift" ||
    normalized === "alt" ||
    normalized === "option"
  ) {
    return null;
  }
  if (normalized === " ") return "space";
  if (normalized === "escape") return "esc";
  if (normalized === "arrowup") return "arrowup";
  if (normalized === "arrowdown") return "arrowdown";
  if (normalized === "arrowleft") return "arrowleft";
  if (normalized === "arrowright") return "arrowright";
  if (normalized.length === 1) return normalized;
  if (/^f\d{1,2}$/.test(normalized)) return normalized;
  if (normalized === "enter" || normalized === "tab" || normalized === "backspace") {
    return normalized;
  }
  if (normalized === "delete" || normalized === "home" || normalized === "end") {
    return normalized;
  }
  if (normalized === "pageup" || normalized === "pagedown") return normalized;
  return null;
}

export function keybindingFromKeyboardEvent(
  event: Pick<KeyboardEvent, "key" | "code" | "metaKey" | "ctrlKey" | "altKey" | "shiftKey">,
  platform: string,
  options?: {
    readonly layoutCharacter?: boolean;
  },
): string | null {
  const keyToken = normalizeShortcutKeyToken(
    options?.layoutCharacter ? recordedLayoutShortcutKey(event) : shortcutKeyFromEvent(event),
  );
  if (!keyToken) return null;

  const parts: string[] = [];
  if (isMacPlatform(platform)) {
    if (event.metaKey) parts.push("mod");
    if (event.ctrlKey) parts.push("ctrl");
  } else {
    if (event.ctrlKey) parts.push("mod");
    if (event.metaKey) parts.push("meta");
  }
  if (event.altKey) parts.push("alt");
  if (event.shiftKey) parts.push("shift");
  parts.push(keyToken);
  return parts.join("+");
}
