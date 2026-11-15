import type { DesktopBridge, DesktopUpdateChannel, DesktopUpdateState } from "@t3tools/contracts";
import { acceptsTrackSwitchRelease } from "@t3tools/shared/cliRelease";
import type { useGT } from "gt-react";

type Translate = ReturnType<typeof useGT>;

type TrackSwitchBridge = Pick<DesktopBridge, "setUpdateChannel">;

/** Saves the track, then, when this app must reinstall, finds a build the database check covers.
 * The saved track is the user's intent and stays even when no such build is ready yet: a track
 * saved toward Stable never offers an older build outside a guarded switch, and "Switch them"
 * retries. Saving when nothing reinstalls lets picking the old track undo a partial switch. */
export async function prepareLocalTrackSwitch(
  bridge: TrackSwitchBridge,
  input: {
    readonly channel: DesktopUpdateChannel;
    readonly version: string;
    readonly reinstall: boolean;
  },
  gt: Translate,
): Promise<
  | { readonly ok: true; readonly local: DesktopUpdateState | null }
  | { readonly ok: false; readonly message: string }
> {
  let local: DesktopUpdateState;
  try {
    // A build on another track re-checks the feed, older releases allowed down to the checked one.
    local = await bridge.setUpdateChannel(
      input.channel,
      input.reinstall ? input.version : undefined,
    );
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : gt("The update track did not change."),
    };
  }
  if (!input.reinstall) return { ok: true, local: null };
  const found = local.downloadedVersion ?? local.availableVersion;
  if (
    (local.status === "available" || local.status === "downloaded") &&
    found !== null &&
    acceptsTrackSwitchRelease(found, input.channel, input.version)
  ) {
    return { ok: true, local };
  }
  return {
    ok: false,
    message:
      found !== null
        ? gt("This app found {found}, which is older than {version}. Try again in a few minutes.", {
            found,
            version: input.version,
          })
        : (local.message ??
          gt("This app found no build of {version} to install.", { version: input.version })),
  };
}

/** When no machine moves, confirming only saves the track; when that track is already saved too,
 * confirming would do nothing. Track-only hosts are not rows but still get a request. */
export function nothingToMove(
  input: {
    readonly label: string;
    readonly channel: DesktopUpdateChannel;
    // Null until the desktop reports it; an unknown track may still need saving.
    readonly savedChannel: DesktopUpdateChannel | null;
    readonly switchesLocal: boolean;
    readonly crossesLocal: boolean;
    readonly rows: ReadonlyArray<{ readonly skipped: string | null }>;
    readonly hasTargets: boolean;
  },
  gt: Translate,
): { readonly note: string | null; readonly disabledReason: string | null } {
  if (input.switchesLocal || input.rows.some((row) => row.skipped === null)) {
    return { note: null, disabledReason: null };
  }
  const reason =
    input.rows.length === 0 && !input.crossesLocal
      ? gt("Every connected machine is already on {track}.", { track: input.label })
      : gt("No machine can switch to {track} now.", { track: input.label });
  return !input.hasTargets && input.savedChannel === input.channel
    ? { note: null, disabledReason: reason }
    : { note: gt("{reason} This only saves the track.", { reason }), disabledReason: null };
}

/**
 * Whether this app stays put while connected machines move: its updater is off, as for a .deb
 * install or without a feed. Off only because a policy rules out its nightly channel, it moves.
 */
export function localUpdaterStaysPut(
  state: Pick<DesktopUpdateState, "enabled" | "channelBlockedByPolicy"> | null | undefined,
  target: DesktopUpdateChannel,
): boolean {
  return (
    state?.enabled === false && !(target === "latest" && state.channelBlockedByPolicy === true)
  );
}
