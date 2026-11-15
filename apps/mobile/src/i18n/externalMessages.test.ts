import { describe, expect, it } from "vite-plus/test";

import { localizeExternalMessage, type Translate } from "./externalMessages";

const gt = ((message: string, values?: Record<string, unknown>) =>
  `<${message.replace(/\{(\w+)\}/g, (_, key: string) => String(values?.[key] ?? ""))}>`) as Translate;

const localize = (message: string) => localizeExternalMessage(message, gt);

describe("localizeExternalMessage", () => {
  it.each([
    ["Git action in progress.", "<Git action in progress.>"],
    ["This device is offline", "<This device is offline>"],
    ["Codex is disabled in T3 Code settings.", "<Codex is disabled in T3 Code settings.>"],
    ["Starting", "<Starting>"],
    ["Listed simulators and emulators", "<Listed simulators and emulators>"],
    [
      "Stopped taking a snapshot of the preview page",
      "<Stopped taking a snapshot of the preview page>",
    ],
    ["Kiro CLI is installed but failed to run.", "<Kiro CLI is installed but failed to run.>"],
  ])("translates the exact message %j", (message, expected) => {
    expect(localize(message)).toBe(expected);
  });

  it.each([
    ["View MR", "<View MR>"],
    [
      "Detached HEAD: checkout a branch before creating a change request.",
      "<Detached HEAD: checkout a branch before creating a change request.>",
    ],
    ["Mac mini's tunnel is offline", "<Mac mini's tunnel is offline>"],
    [
      "Or run `t3 auth connect-device approve 1234-5678` on Mac mini.",
      "<Or run `t3 auth connect-device approve 1234-5678` on Mac mini.>",
    ],
    ["Working 1m 5s", "<Working <1m> <5s>>"],
    ["Linking MR #12", "<Linking MR #12>"],
    ["Requested interrupts for 2 threads", "<Requested interrupts for 2 threads>"],
    ["Sent 3 messages to 1 thread", "<Sent 3 messages to 1 thread>"],
    [
      "Pi 0.80.0 is unsupported. Update to Pi 0.84.3 or newer.",
      "<Pi 0.80.0 is unsupported. Update to Pi 0.84.3 or newer.>",
    ],
    [
      "Weekly reset: Refills your weekly limit. This cannot be undone.",
      "<<Weekly reset>: <Refills your weekly limit.> This cannot be undone.>",
    ],
    ["Waiting on 2 subagents and 1 command", "<Waiting on <<2 subagents> and <1 command>>>"],
    ["3 side chats need approval", "<3 side chats need approval>"],
    ["Acme limits threads to Auto-accept edits.", "<Acme limits threads to <Auto-accept edits>.>"],
    [
      "Failed to connect. Reconnecting... Reason: Relay rejected the DPoP proof.",
      "<Failed to connect. Reconnecting... Reason: <Relay rejected the DPoP proof.>>",
    ],
    [
      "Could not start Codex CLI (`/opt/codex`). Check Settings → Providers → Codex → Binary path on the server. Make sure the configured executable exists and can be run.",
      "<Could not start Codex CLI (`/opt/codex`). Check Settings → Providers → Codex → Binary path on the server. Make sure the configured executable exists and can be run.>",
    ],
    [
      "Acme's policy does not allow the Codex provider.",
      "<Acme's policy does not allow the Codex provider.>",
    ],
  ])("fills the template for %j", (message, expected) => {
    expect(localize(message)).toBe(expected);
  });

  it("localizes each part of a composite message", () => {
    expect(localize("Receiving objects · 45% · Stalled")).toBe(
      "<Receiving objects> · 45% · <Stalled>",
    );
    expect(localize('Remove project "web"?\nPath: /src/web\nThis action cannot be undone.')).toBe(
      '<Remove project "web"?>\n<Path: /src/web>\n<This action cannot be undone.>',
    );
    expect(
      localize(
        "Relay rejected the DPoP proof. Hint: Try again. If the problem continues, copy the trace ID.",
      ),
    ).toBe(
      "<Relay rejected the DPoP proof.> <Hint: Try again. If the problem continues, copy the trace ID.>",
    );
    expect(localize("Ran 3 commands, read 2 files, and changed 1 file")).toBe(
      "<<<Ran 3 commands>, <Read 2 files>>, and <Changed 1 file>>",
    );
    expect(localize("Started 3 review guides, 1 failed and tried to read 2 threads")).toBe(
      "<<<Started 3 review guides>, 1 failed> and <Tried to read 2 threads>>",
    );
  });

  it.each([
    "Something the server said.",
    "Waiting on the build",
    "Ran 3 commands and used Linear",
    "Starting sign-in again",
    "Read 2 threads and emulators",
  ])("keeps the unknown message %j", (message) => {
    expect(localize(message)).toBe(message);
  });
});
