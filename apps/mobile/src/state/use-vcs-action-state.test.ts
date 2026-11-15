import { describe, expect, it, vi } from "vite-plus/test";

const mocks = vi.hoisted(() => ({
  notificationAsync: vi.fn(() => Promise.resolve()),
}));

vi.mock("gt-react-native", () => ({
  useGT: () => (message: string, values?: Record<string, unknown>) =>
    message.replace(/\{(\w+)\}/g, (_: string, key: string) => String(values?.[key] ?? "")),
}));
vi.mock("expo-haptics", () => ({
  NotificationFeedbackType: { Success: "success", Error: "error" },
  notificationAsync: mocks.notificationAsync,
}));

vi.mock("./vcs", () => ({ vcsActionManager: {} }));

import { dismissGitActionResult, showGitActionResult } from "./use-vcs-action-state";

describe("showGitActionResult", () => {
  it("buzzes once per reported result with the matching feedback type", () => {
    showGitActionResult({ type: "success", title: "Pushed" });
    showGitActionResult({ type: "error", title: "Git action failed", description: "rejected" });
    dismissGitActionResult();

    expect(mocks.notificationAsync.mock.calls).toEqual([["success"], ["error"]]);
  });
});
