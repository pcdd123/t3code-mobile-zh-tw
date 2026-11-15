import type { useGT } from "gt-react-native";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

type Translate = ReturnType<typeof useGT>;

type IntervalUnit = "week" | "day" | "hour" | "minute" | "second" | "millisecond";

function everyUnitLabel(unit: IntervalUnit, gt: Translate): string {
  switch (unit) {
    case "week":
      return gt("Every week");
    case "day":
      return gt("Every day");
    case "hour":
      return gt("Every hour");
    case "minute":
      return gt("Every minute");
    case "second":
      return gt("Every second");
    case "millisecond":
      return gt("Every millisecond");
  }
}

function unitCountLabel(unit: IntervalUnit, count: number, gt: Translate): string {
  switch (unit) {
    case "week":
      return count === 1 ? gt("1 week") : gt("{count} weeks", { count });
    case "day":
      return count === 1 ? gt("1 day") : gt("{count} days", { count });
    case "hour":
      return count === 1 ? gt("1 hour") : gt("{count} hours", { count });
    case "minute":
      return count === 1 ? gt("1 minute") : gt("{count} minutes", { count });
    case "second":
      return count === 1 ? gt("1 second") : gt("{count} seconds", { count });
    case "millisecond":
      return count === 1 ? gt("1 millisecond") : gt("{count} milliseconds", { count });
  }
}

export function formatScheduledTaskInterval(everyMs: number, gt: Translate): string {
  const units = [
    [7 * DAY, "week"],
    [DAY, "day"],
    [HOUR, "hour"],
    [MINUTE, "minute"],
    [1_000, "second"],
    [1, "millisecond"],
  ] as const;
  let remaining = everyMs;
  const parts: string[] = [];
  for (const [size, unit] of units) {
    const count = Math.floor(remaining / size);
    if (count === 0) continue;
    if (count === 1 && remaining === everyMs && remaining === size) return everyUnitLabel(unit, gt);
    parts.push(unitCountLabel(unit, count, gt));
    remaining %= size;
  }
  return gt("Every {interval}", { interval: parts.join(" ") });
}

function localCalendarDay(date: Date): number {
  // Compare calendar days, not 24-hour spans: DST days can have 23 or 25 hours.
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY;
}

export function formatNextScheduledTaskRun(nextRunAt: string, now: number, gt: Translate): string {
  const next = new Date(nextRunAt);
  const current = new Date(now);
  const remaining = next.getTime() - now;
  if (!Number.isFinite(remaining)) return gt("Next run unavailable");
  if (remaining <= 0) return gt("Next run due");

  const days = localCalendarDay(next) - localCalendarDay(current);
  if (days === 0) {
    if (remaining < MINUTE) return gt("Next run in less than a minute");
    const minutes = Math.round(remaining / MINUTE);
    if (minutes < 60) {
      return minutes === 1
        ? gt("Next run in 1 minute")
        : gt("Next run in {count} minutes", { count: minutes });
    }
    const hours = Math.round(remaining / HOUR);
    return hours === 1
      ? gt("Next run in 1 hour")
      : gt("Next run in {count} hours", { count: hours });
  }

  const time = next.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (days === 1) return gt("Next run tomorrow at {time}", { time });
  if (days <= 7) {
    return gt("Next run next {weekday} at {time}", {
      weekday: next.toLocaleDateString([], { weekday: "long" }),
      time,
    });
  }
  const date = next.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    ...(next.getFullYear() !== current.getFullYear() ? { year: "numeric" as const } : {}),
  });
  return gt("Next run {date} at {time}", { date, time });
}
