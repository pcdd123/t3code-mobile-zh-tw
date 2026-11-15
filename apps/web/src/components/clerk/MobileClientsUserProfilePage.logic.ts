import { englishGt, type Translate } from "../Localized";
import type { RelayClientDeviceRecord } from "@t3tools/contracts/relay";

const mobileClientUpdatedAtFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

const NOTIFICATION_PREFERENCES = [
  ["notifyOnApproval", "approvals"],
  ["notifyOnInput", "input requests"],
  ["notifyOnCompletion", "completions"],
  ["notifyOnFailure", "failures"],
] as const satisfies ReadonlyArray<
  readonly [keyof RelayClientDeviceRecord["notifications"], string]
>;

export function mobileClientPlatformLabel(device: RelayClientDeviceRecord): string {
  const platform =
    device.platform === "android"
      ? "Android"
      : device.iosMajorVersion === null
        ? "iOS"
        : `iOS ${device.iosMajorVersion}`;
  return `${platform}${device.appVersion ? ` · T3 Code ${device.appVersion}` : ""}`;
}

function notificationPreferenceLabel(label: string, gt: Translate): string {
  switch (label) {
    case "approvals":
      return gt("approvals");
    case "input requests":
      return gt("input requests");
    case "completions":
      return gt("completions");
    case "failures":
      return gt("failures");
    default:
      return label;
  }
}

export function mobileClientNotificationDetail(
  device: RelayClientDeviceRecord,
  gt: Translate = englishGt,
): string {
  if (!device.notifications.enabled) {
    return gt("Push notifications are disabled on this device.");
  }

  const enabledPreferences = NOTIFICATION_PREFERENCES.flatMap(([preference, label]) =>
    device.notifications[preference] ? [notificationPreferenceLabel(label, gt)] : [],
  );
  return enabledPreferences.length > 0
    ? gt("Alerts enabled for {types}.", { types: enabledPreferences.join(gt(", ")) })
    : gt("Push notifications are enabled, but no alert types are selected.");
}

export function mobileClientUpdatedAtLabel(updatedAt: string, gt: Translate = englishGt): string {
  const date = new Date(updatedAt);
  return Number.isNaN(date.getTime())
    ? gt("Update time unavailable")
    : gt("Updated {time}", { time: mobileClientUpdatedAtFormatter.format(date) });
}
