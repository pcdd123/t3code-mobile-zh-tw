import type { ClientSettingsPatch, DesktopSnapShotState, SnapShotSound } from "@t3tools/contracts";
import type { useGT } from "gt-react";
import {
  captureSetupBackend,
  captureSetupDesktopName,
  captureSetupAccessReady,
  captureSetupMacPermissionsReady,
} from "./SnapShotSetupDialog.logic";

export function snapShotStatus(state: DesktopSnapShotState | null, enabled: boolean): string {
  if (!state) return "Checking snapshots…";
  if (state.mode === "unavailable") return state.message ?? "Not supported on this platform.";
  if (!enabled) return "Turn this on to set up snapshots.";
  return snapShotSetupSummary(state, enabled);
}

export function snapShotSetupSummary(state: DesktopSnapShotState, enabled: boolean): string {
  if (state.message) return "Capture needs attention";
  if (state.linuxBackend === "hyprland" && state.hyprlandHelper?.status !== "ready")
    return state.hyprlandHelper?.status === "error"
      ? "Check capture access in setup"
      : "Install the capture helper to continue";
  if (captureSetupBackend(state) === "gnome" && state.gnomeExtension?.status !== "enabled")
    return "Set up active-window snapshots";
  if (captureSetupBackend(state) === "kde" && state.kdeHelper?.status !== "ready")
    return state.kdeHelper?.status === "error"
      ? "Check capture access in setup"
      : "Install the capture helper to continue";
  if (captureSetupBackend(state) === "picker")
    return "Manual capture only. You'll choose a window each time";
  if (!enabled) return "Enable capture to continue";
  if (state.shortcutPending)
    return state.linuxBackend === "hyprland"
      ? "Connecting your shortcut…"
      : "Waiting for shortcut permission";
  if (state.shortcutVerified) return "Ready to capture";
  if (state.linuxBackend === "niri" && state.shortcutBinding)
    return "Use your shortcut from another app";
  if (state.linuxBackend === "hyprland" && state.shortcutActionRegistered)
    return "Use your shortcut from another app";
  if (state.shortcutRegistered) return state.shortcutLabel ? "Ready to capture" : "Shortcut saved";
  return "Finish shortcut setup";
}

export function snapShotShortcutStatus(state: DesktopSnapShotState | null): string | null {
  if (!state) return null;
  if (state.linuxBackend === "hyprland") return state.shortcutMessage;
  if (state.shortcutPending) return "Approve the shortcut permission prompt to continue.";
  if (state.shortcutRegistered) return state.mode === "portal" ? null : "Shortcut saved.";
  return state.shortcutMessage;
}

export function snapShotSetupButtonLabel(state: DesktopSnapShotState | null): string {
  if (!state) return "Continue setup";
  if (captureSetupAccessReady(state)) return "Manage capture";
  const desktop = captureSetupDesktopName(state);
  return desktop ? `Set up ${desktop} capture` : "Continue setup";
}

export function snapShotSetupComplete(
  state: DesktopSnapShotState | null,
  includeAccessibility: boolean,
): boolean {
  if (state?.windows) return true;
  return (
    state?.macPermissions !== undefined &&
    captureSetupAccessReady(state) &&
    captureSetupMacPermissionsReady(state, includeAccessibility) &&
    state.shortcutRegistered
  );
}

export type SnapShotSoundSelection = SnapShotSound | "off";

export function snapShotFeedbackUnavailableMessage(
  state: DesktopSnapShotState | null,
): string | undefined {
  if (state?.mode !== "portal" || state.linuxFeedbackAvailable) return undefined;
  if (state.linuxBackend === "hyprland")
    return state.hyprlandHelper?.status === "ready"
      ? "Capture effects aren't available on this desktop."
      : "Install or update the capture helper to enable effects.";
  if (state.linuxBackend === "niri") return "Capture effects aren't available on Niri.";
  if (state.linuxBackend === "kde")
    return state.kdeHelper?.status === "ready"
      ? "Capture effects aren't available on this desktop."
      : "Install or update the capture helper to enable effects.";
  return state.linuxBackend === "gnome-extension"
    ? "Update the GNOME extension, then sign out and back in to enable effects."
    : captureSetupBackend(state) === "gnome"
      ? "Finish extension setup to enable effects."
      : "Capture effects aren't available on this desktop.";
}

export function snapShotDescription(state: DesktopSnapShotState | null): string {
  return state?.mode === "portal" && captureSetupBackend(state) === "picker"
    ? "Automatic capture isn't available here. Choose a window instead."
    : "Capture a window and attach it to your current draft.";
}

export function snapShotAccessibilityUnavailableMessage(
  state: DesktopSnapShotState | null,
): string | undefined {
  if (state?.mode !== "portal") return undefined;
  if (state.linuxBackend === "picker" || state.linuxBackend === "screenshot-portal")
    return "This desktop only provides a screenshot.";
  return undefined;
}

export function snapShotUnavailableMessage(hasBridge: boolean): string | undefined {
  if (hasBridge) return undefined;
  return typeof window !== "undefined" && window.desktopBridge
    ? "Update the desktop app to use snapshots."
    : "Only available in the desktop app.";
}

export function snapShotSoundPatch(sound: SnapShotSoundSelection): ClientSettingsPatch {
  return sound === "off"
    ? { snapShotPlaySound: false }
    : { snapShotPlaySound: true, snapShotSound: sound };
}

export function createRecordingRequestTracker() {
  let currentRequest: symbol | null = null;

  return {
    tryBegin() {
      if (currentRequest) return null;
      currentRequest = Symbol();
      return currentRequest;
    },
    clear() {
      currentRequest = null;
    },
    owns(request: symbol) {
      return currentRequest === request;
    },
  };
}

/** Status text above is English ids; text from the desktop app passes through unchanged. */
export function localizeSnapShotText(
  gt: ReturnType<typeof useGT>,
  text: string | null | undefined,
): string | undefined {
  if (text === null || text === undefined) return undefined;
  const setUp = /^Set up (.+) capture$/.exec(text);
  if (setUp) return gt("Set up {desktop} capture", { desktop: setUp[1] });
  switch (text) {
    case "Checking snapshots…":
      return gt("Checking snapshots…");
    case "Not supported on this platform.":
      return gt("Not supported on this platform.");
    case "Turn this on to set up snapshots.":
      return gt("Turn this on to set up snapshots.");
    case "Capture needs attention":
      return gt("Capture needs attention");
    case "Check capture access in setup":
      return gt("Check capture access in setup");
    case "Install the capture helper to continue":
      return gt("Install the capture helper to continue");
    case "Set up active-window snapshots":
      return gt("Set up active-window snapshots");
    case "Manual capture only. You'll choose a window each time":
      return gt("Manual capture only. You'll choose a window each time");
    case "Enable capture to continue":
      return gt("Enable capture to continue");
    case "Connecting your shortcut…":
      return gt("Connecting your shortcut…");
    case "Waiting for shortcut permission":
      return gt("Waiting for shortcut permission");
    case "Ready to capture":
      return gt("Ready to capture");
    case "Use your shortcut from another app":
      return gt("Use your shortcut from another app");
    case "Shortcut saved":
      return gt("Shortcut saved");
    case "Finish shortcut setup":
      return gt("Finish shortcut setup");
    case "Approve the shortcut permission prompt to continue.":
      return gt("Approve the shortcut permission prompt to continue.");
    case "Shortcut saved.":
      return gt("Shortcut saved.");
    case "Continue setup":
      return gt("Continue setup");
    case "Manage capture":
      return gt("Manage capture");
    case "Capture effects aren't available on this desktop.":
      return gt("Capture effects aren't available on this desktop.");
    case "Install or update the capture helper to enable effects.":
      return gt("Install or update the capture helper to enable effects.");
    case "Capture effects aren't available on Niri.":
      return gt("Capture effects aren't available on Niri.");
    case "Update the GNOME extension, then sign out and back in to enable effects.":
      return gt("Update the GNOME extension, then sign out and back in to enable effects.");
    case "Finish extension setup to enable effects.":
      return gt("Finish extension setup to enable effects.");
    case "Automatic capture isn't available here. Choose a window instead.":
      return gt("Automatic capture isn't available here. Choose a window instead.");
    case "Capture a window and attach it to your current draft.":
      return gt("Capture a window and attach it to your current draft.");
    case "This desktop only provides a screenshot.":
      return gt("This desktop only provides a screenshot.");
    case "Update the desktop app to use snapshots.":
      return gt("Update the desktop app to use snapshots.");
    case "Only available in the desktop app.":
      return gt("Only available in the desktop app.");
    case "Still unable to check access. See Advanced for help.":
      return gt("Still unable to check access. See Advanced for help.");
    case "Ready. You'll choose a window each time.":
      return gt("Ready. You'll choose a window each time.");
    case "Still waiting for you to sign out and back in.":
      return gt("Still waiting for you to sign out and back in.");
    case "Ready. Continue to choose your shortcut.":
      return gt("Ready. Continue to choose your shortcut.");
    case "Not ready yet. Finish the step above.":
      return gt("Not ready yet. Finish the step above.");
    default:
      return text;
  }
}
