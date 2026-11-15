import { describe, expect, it } from "vite-plus/test";

import { englishGt, type Translate } from "../components/Localized";
import { localizeExternalMessage } from "./externalMessages";
import { localizeToolActivityLabel } from "./toolActivityLabels";

// Brackets mark text that went through gt, with placeholders filled.
const gt = ((message: string, values?: Record<string, unknown>) =>
  `[${message.replace(/\{(\w+)\}/g, (_, key: string) => String(values?.[key] ?? ""))}]`) as unknown as Translate;

describe("localizeExternalMessage", () => {
  it.each([
    ["exact", "This device is offline", "[This device is offline]"],
    ["templated", "Mac mini's tunnel is offline", "[Mac mini's tunnel is offline]"],
    [
      "templated with a nested known value",
      "Claude Code the installed version is too old for Opus. Upgrade to v2.1.0 or newer to access it.",
      "[Claude Code [the installed version] is too old for Opus. Upgrade to v2.1.0 or newer to access it.]",
    ],
    [
      "optional sentences joined by the server",
      "Could not start Codex CLI (`codex`). Check Settings → Providers → Codex → Binary path on the server. Installing ChatGPT or Codex desktop may not add codex to PATH.",
      "[Could not start Codex CLI (`codex`). Check Settings → Providers → Codex → Binary path on the server.][Installing ChatGPT or Codex desktop may not add codex to PATH.]",
    ],
    [
      "known and unknown sentences",
      "Relay rejected the DPoP proof. Something new happened.",
      "[Relay rejected the DPoP proof.] Something new happened.",
    ],
    ["segments", "Claude & GPT (shared) · Weekly", "Claude & GPT (shared) · [Weekly]"],
    ["duration", "resets in 2h 5m", "[resets in [2h] [5m]]"],
    [
      "background work groups",
      "Running 2 subagents and 1 command",
      "[Running [2 subagents]、[1 command]]",
    ],
    [
      "unknown passthrough",
      "Something the client has never seen.",
      "Something the client has never seen.",
    ],
  ])("%s", (_, message, expected) => {
    expect(localizeExternalMessage(message, gt)).toBe(expected);
  });
});

describe("localizeToolActivityLabel", () => {
  it.each([
    ["present", "Linking a pull request", "[Linking a pull request]"],
    ["past", "Took a snapshot of the preview page", "[Took a snapshot of the preview page]"],
    [
      "failed",
      "Failed to take a snapshot of the preview page",
      "[Failed to take a snapshot of the preview page]",
    ],
    ["named pull request", "Stopped watching PR #12", "[Stopped watching PR #12]"],
    ["counted summary", "Tried to delegate 2 tasks", "[Tried to delegate 2 tasks]"],
    ["detail with and", "Listing simulators and emulators", "[Listing simulators and emulators]"],
    ["free text with and", "Searched cats and dogs", "[Searched cats and dogs]"],
    [
      "joined summary",
      "Read 3 files, changed 1 file, and ran 2 commands",
      "[[Read 3 files], [Changed 1 file], and [Ran 2 commands]]",
    ],
    [
      "integration names",
      "Used Chrome and Figma integrations and ran 1 command",
      "[[Used [Chrome and Figma] integrations] and [Ran 1 command]]",
    ],
    ["unknown", "Something the client has never seen", null],
  ])("%s", (_, label, expected) => {
    expect(localizeToolActivityLabel(label, gt)).toBe(expected);
  });

  it("keeps English summaries as they were", () => {
    const label = "Sent 2 messages to 1 thread and performed 3 other actions";
    expect(localizeToolActivityLabel(label, englishGt)).toBe(label);
  });
});
