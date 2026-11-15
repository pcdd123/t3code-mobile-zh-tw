import { describe, expect, it } from "vite-plus/test";

import { formatNextScheduledTaskRun } from "./scheduledTaskPresentation";

const gt = (message: string, values?: Record<string, unknown>) =>
  message.replace(/\{(\w+)\}/g, (_: string, key: string) => String(values?.[key] ?? ""));

describe("formatNextScheduledTaskRun", () => {
  it("names the rounded unit for a run later today", () => {
    const now = new Date(2026, 10, 3, 10, 0, 0).getTime();
    const at = (minutes: number) => new Date(now + minutes * 60_000).toISOString();
    expect(formatNextScheduledTaskRun(at(59), now, gt)).toBe("Next run in 59 minutes");
    expect(formatNextScheduledTaskRun(at(59.5), now, gt)).toBe("Next run in 1 hour");
    expect(formatNextScheduledTaskRun(at(150), now, gt)).toBe("Next run in 3 hours");
  });
});
