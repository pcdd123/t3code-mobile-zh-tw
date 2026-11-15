import type { useGT } from "gt-react";

type Translate = ReturnType<typeof useGT>;
type Template = readonly [
  pattern: RegExp,
  render: (gt: Translate, match: RegExpExecArray) => string,
];

// Shared packages and the server send English; the GT extractor only scans apps/web, so the
// literals live here. Each one is byte-identical to its source.
function exactMessages(gt: Translate): ReadonlyArray<() => string> {
  return [
    // Connection diagnosis (client-runtime/connection/diagnosis.ts)
    () => gt("This device is offline"),
    () => gt("This device is still loading its T3 Connect sign-in"),
    () => gt("This device's clock is off"),
    () => gt("T3 Connect returned an error"),
    () => gt("This device could not prepare the connection"),
    () => gt("T3 Connect did not accept this device's sign-in"),
    () => gt("This device can't reach T3 Connect"),
    () => gt("Connect this device to the internet. T3 Code reconnects on its own."),
    () => gt("Wait a moment. T3 Code retries on its own."),
    () => gt("If it keeps waiting, reload or restart T3 Code on this device."),
    () => gt("Check that this device is signed in to the same T3 Connect account as the host."),
    () => gt("Wait a minute. T3 Code retries on its own."),
    () => gt("Wait a few minutes. T3 Code retries on its own."),
    () => gt("If it keeps failing, copy the diagnostics and report it."),
    () => gt("Restart T3 Code on this device."),
    () => gt("Sign out of T3 Connect and sign in again."),
    () => gt("Check this device's internet connection."),
    () => gt("A VPN, firewall, or ad blocker on this device can block T3 Connect."),
    () => gt("A VPN, firewall, or DNS filter on this device can block the tunnel."),
    () => gt("Try another network, or add a direct route such as a Tailscale address."),
    () => gt("Retry. If it keeps failing, copy the diagnostics."),
    () => gt("This device"),
    () => gt("Cause"),
    () => gt("HTTP status"),
    () => gt("Attempts"),
    () => gt("Next retry"),
    () => gt("Route"),
    () => gt("App version"),
    () => gt("Host version"),
    () => gt("Error"),
    () => gt("Trace ID"),
    () => gt("Direct"),
    // Relay errors (client-runtime/relay/errorPresentation.ts, web cloud/relayFailureReason.ts)
    () =>
      gt("Hint: Check that automatic date and time is enabled on both devices, then try again."),
    () =>
      gt(
        "Hint: Try again. If it still fails, clock skew may be the cause; check that automatic date and time is enabled on both devices.",
      ),
    () => gt("Hint: Try again. If the problem continues, copy the trace ID."),
    () => gt("Relay rejected the cloud session token."),
    () => gt("Relay rejected the DPoP proof."),
    () => gt("Relay rejected the authenticated request."),
    () => gt("Relay rejected an expired environment link proof."),
    () =>
      gt(
        "Relay has no active link for this environment. If it was deregistered from T3 Connect, link it again on that machine.",
      ),
    () => gt("The environment's T3 Connect tunnel is still being set up."),
    () =>
      gt(
        "This environment is linked only to publish agent activity, so it cannot accept connections. On that computer, open Settings > Sharing & access and turn T3 Connect on.",
      ),
    () => gt("Relay rejected the environment connection request."),
    () => gt("Relay timed out while contacting the environment endpoint."),
    () => gt("Relay rejected an expired agent activity publish proof."),
    () =>
      gt(
        "Relay timed out before it finished the request (HTTP 504). Try again in a few minutes. If it keeps failing, copy the trace ID when you report it.",
      ),
    () =>
      gt(
        "Offline for a while, so its T3 Connect tunnel was removed. Start T3 Code on that computer and update it to the latest version to reconnect.",
      ),
    () => gt("T3 Connect timed out. Try again."),
    () => gt("Could not reach T3 Connect. Check your network."),
    () => gt("T3 Connect is unavailable. Try again."),
    // Voice input (client-runtime/voice-input, web speech/)
    () =>
      gt(
        "Microphone access is required for voice input. Allow access in your browser or system settings and try again.",
      ),
    () => gt("Microphone access is required for voice input."),
    () => gt("This draft is no longer available."),
    () => gt("Another voice recording is already active."),
    () => gt("Voice transcription is not available."),
    () => gt("Voice transcription is still finishing. Try again shortly."),
    () => gt("Voice transcription is not available for this language."),
    () => gt("Could not prepare voice transcription."),
    () => gt("Could not start voice recording."),
    () => gt("Voice recording was interrupted."),
    () => gt("Could not finish voice recording."),
    () => gt("Could not transcribe this recording."),
    () => gt("Voice transcription on this environment failed."),
    () => gt("The draft changed while voice input was running. The transcript was not added."),
    () => gt("No speech was detected."),
    () => gt("Microphone processing failed."),
    () => gt("The microphone disconnected."),
    () => gt("Voice input stopped when the app moved to the background."),
    () => gt("Voice transcription was cancelled."),
    () => gt("Live transcription stopped responding."),
    () => gt("Voice consent was revoked."),
    () => gt("The voice connection closed. Please record again."),
    () => gt("Could not connect to live transcription."),
    () => gt("Voice recordings are limited to five minutes."),
    () => gt("Could not send microphone audio."),
    () => gt("Could not finish live transcription."),
    () => gt("Voice transcription failed. Check the destination in Settings → Voice."),
    () => gt("Choose an OpenRouter model in Settings → Voice."),
    // Device stream (client-runtime/device/stream.ts)
    () => gt("No video received from the device. Reconnect to try again."),
    () => gt("Could not receive the device stream. Reconnect to try again."),
    () => gt("Could not display the device stream. Reconnect to try again."),
    () => gt("Video decoder restarted."),
    () => gt("This browser cannot play this device's WebRTC stream."),
    () => gt("This Device Hub does not provide fixed Duo display feeds."),
    () => gt("Switching to WebRTC."),
    () => gt("This browser cannot receive the device's WebRTC stream."),
    () => gt("This browser cannot decode the Android stream (WebCodecs unavailable)."),
    () => gt("This browser cannot decode this device's stream (WebCodecs unavailable)."),
    () => gt("Video decoder fell behind. Reconnecting…"),
    () => gt("Device stream stopped receiving video. Reconnecting…"),
    // Thread sync (client-runtime/state/threads.ts)
    () => gt("Could not synchronize the thread."),
    () => gt("Could not load earlier activity."),
    () => gt("Environment is not connected."),
    () => gt("History did not advance."),
    () => gt("Work history did not advance."),
    // Thread execution (client-runtime/state/threadExecution.ts)
    () => gt("Starting"),
    () => gt("Idle"),
    () => gt("Working"),
    () => gt("Waiting"),
    () => gt("Completed"),
    () => gt("Interrupted"),
    () => gt("Failed"),
    () => gt("Cancelled"),
    () => gt("Pursuing goal"),
    () => gt("Goal paused"),
    () => gt("Goal blocked"),
    () => gt("Goal hit a usage limit"),
    () => gt("Goal reached its token budget"),
    () => gt("Goal complete"),
    () => gt("Goal set"),
    () => gt("1 check"),
    () => gt("Waiting on a subagent"),
    () => gt("Waiting on a command"),
    () => gt("Waiting on a monitor"),
    () => gt("Waiting on a background task"),
    () => gt("Running a subagent"),
    () => gt("Running a command"),
    () => gt("Running a monitor"),
    () => gt("Running a background task"),
    () => gt("subagent"),
    () => gt("command"),
    () => gt("monitor"),
    () => gt("background task"),
    () => gt("1 subagent"),
    () => gt("1 command"),
    () => gt("1 monitor"),
    () => gt("1 background task"),
    // Usage limits (shared/usageLimits.ts, server usage probes)
    () => gt("Overall"),
    () => gt("All usage on your plan this billing cycle."),
    () => gt("Cursor Models"),
    () => gt("Grok, Composer, and Auto use this allowance."),
    () => gt("Other Models"),
    () => gt("Usage allowance for third-party models such as Claude, GPT, and Gemini."),
    () => gt("This account has no subscription limits."),
    () => gt("Could not read limits."),
    () => gt("No limits reported."),
    () => gt("Use"),
    () => gt("Use reset"),
    () => gt("No reset credits banked"),
    () => gt("1 reset credit banked"),
    () =>
      gt(
        "This redeems one credit on your account and clears the current rate-limit windows. It cannot be undone.",
      ),
    () => gt("resets now"),
    () => gt("Resets momentarily"),
    () => gt("Session"),
    () => gt("Weekly"),
    () => gt("Monthly"),
    () => gt("5-hour"),
    () => gt("Monthly spend"),
    () => gt("Monthly credit limit"),
    () => gt("Reported quota"),
    () => gt("Quota"),
    () => gt("5-hour reset"),
    () => gt("Refills your 5-hour limit."),
    () => gt("Weekly reset"),
    () => gt("Refills your weekly limit."),
    () => gt("Fable reset"),
    () =>
      gt(
        "Refills your Fable allowance and gives back what Fable used on your weekly limit. It doesn't reset your whole week.",
      ),
    () => gt("Full reset"),
    () => gt("Refills your 5-hour and weekly limits."),
    () => gt("ChatGPT usage"),
    () =>
      gt(
        "ChatGPT tracks subscription usage across connected apps. Open Usage settings with the account you connected to Codex.",
      ),
    () => gt("Sign in with Google to see Antigravity limits."),
    () => gt("Antigravity did not return usable quota information."),
    () => gt("Could not read Antigravity limits. Refresh provider status to retry."),
    // Session permissions (shared/authScopeOptions.ts)
    () => gt("View environment"),
    () => gt("Read threads, status, checkpoints, and configuration."),
    () => gt("Operate tasks"),
    () => gt("Start, update, and stop tasks."),
    () => gt("Change environment settings"),
    () => gt("Edit environment preferences and keybindings."),
    () => gt("Manage providers"),
    () => gt("Configure, install, sign in to, and update providers and usage sources."),
    () => gt("Maintain environment"),
    () => gt("Update the server and control environment processes."),
    () => gt("Control previews"),
    () => gt("Open browser previews and host browser automation."),
    () => gt("View diagnostics and usage"),
    () => gt("Read process diagnostics, resource history, and usage totals."),
    () => gt("View terminals"),
    () => gt("Read existing terminal output and status."),
    () => gt("Use terminals"),
    () => gt("Create terminals and send input to running shells."),
    () => gt("Change source control"),
    () => gt("Commit, push, manage branches and repositories, and change pull requests."),
    () => gt("Read files"),
    () => gt("Browse host files, search workspaces, and inspect local changes."),
    () => gt("Write files"),
    () => gt("Edit workspace files and save plans to disk."),
    () => gt("View access"),
    () => gt("Inspect pairing links and authorized clients."),
    () => gt("Manage access"),
    () => gt("Issue and revoke credentials for other clients."),
    () => gt("View relay"),
    () => gt("Inspect managed relay connectivity."),
    () => gt("Manage relay"),
    () => gt("Change managed tunnel connectivity."),
    () => gt("Connect to this environment to view this session’s permissions."),
    () => gt("This environment did not accept your session. Reconnect to try again."),
    () => gt("Could not verify your permissions. Retrying automatically."),
    () => gt("Checking permissions…"),
    // Codex artifact templates (shared/codexArtifactTemplates.ts)
    () => gt("Document template"),
    () => gt("Presentation template"),
    () => gt("Spreadsheet template"),
    () => gt("Site template"),
    () => gt("Google Doc template"),
    () => gt("Google Slides template"),
    () => gt("Google Sheet template"),
    () => gt("Image template"),
    () => gt("Email template"),
    () => gt("Slack template"),
    // Provider status, shared (provider-core, apps/server/src/provider)
    () => gt("Install the update now or review provider settings."),
    () => gt("Provider refresh failed after update."),
    () => gt("Reading secrets…"),
    () => gt("This provider version is known to be incompatible with this T3 Code release."),
    () => gt("This provider version is outside the supported range for this T3 Code release."),
    () => gt("This provider version has limited compatibility with this T3 Code release."),
    () =>
      gt(
        "OpenCode CLI updated. Restart the configured local OpenCode server to use the new version.",
      ),
    () => gt("Update command failed to run."),
    () => gt("Update command failed."),
    () => gt("Waiting for another provider update to finish."),
    () => gt("Checking for the latest version"),
    () => gt("Provider installation changed. Refresh and try again."),
    () =>
      gt(
        "This version is no longer recommended or this installer cannot install a specific version. Refresh provider settings.",
      ),
    () =>
      gt(
        "The latest provider version is incompatible with this T3 Code release. Review provider settings.",
      ),
    () => gt("Already up to date."),
    () => gt("Waiting for running provider work to finish."),
    () => gt("Verifying the installed version"),
    () => gt("Update command completed, but T3 Code could not verify the provider version."),
    () => gt("Update command completed, but T3 Code still detects an outdated provider version."),
    () => gt("Provider updated."),
    () => gt("Update stopped before it finished."),
    () => gt("An update is already running for this provider."),
    () => gt("This provider does not support one-click updates."),
    // Provider sign-in flow, shared (provider-core providerAuthFlow.ts, ProviderAuthService.ts, providerInstallation.ts)
    () => gt("Sign-in failed. Start again."),
    () => gt("This provider's shared sign-in changed."),
    () => gt("Starting sign-in."),
    () => gt("Complete sign-in to continue."),
    () => gt("Checking provider sign-in."),
    () => gt("Sign-in complete."),
    () => gt("Sign-in cancelled."),
    () => gt("Signed out."),
    () => gt("Could not sign out. Try again."),
    () => gt("Sign-in is in progress in another client."),
    () => gt("This sign-in is no longer active in this client."),
    () => gt("Finish or cancel the existing sign-in first."),
    () => gt("Provider sign-in is changing. Try again after it finishes."),
    () => gt("Provider setup is already in progress."),
    () => gt("Could not start sign-in. Try again."),
    () => gt("The provider did not advertise this sign-in method."),
    () => gt("Sign-in expired. Start again."),
    () => gt("This sign-in interaction is no longer available."),
    () => gt("A sign-in response is already in progress."),
    () => gt("This sign-in does not accept a redirect URL."),
    () => gt("Provider setup is already stopping."),
    () => gt("This provider does not support sign-in in T3 Code."),
    () => gt("This provider instance is no longer available."),
    () => gt("Could not read the provider's active sessions. Try again."),
    () => gt("Could not stop all sessions for this provider. Try again."),
    () =>
      gt("Another provider instance is changing this shared sign-in. Finish or cancel it first."),
    () => gt("This provider does not support ChatGPT profile transfer."),
    () => gt("This provider does not accept this sign-in interaction."),
    () => gt("This provider does not support removing saved sign-in methods."),
    () => gt("Could not read provider installation settings."),
    () => gt("Managed installation is not available for this provider instance."),
    () => gt("The provider instance configuration is invalid."),
    () => gt("Choose managed setup to install Codex in T3 Code."),
    () =>
      gt(
        "This instance uses a custom executable. Clear its binary path to manage installation in T3 Code.",
      ),
    () => gt("Installation cancelled. The previous runtime is unchanged."),
    () => gt("This installation is no longer current. Refresh its status before cancelling."),
    // Codex (CodexProvider.ts, CodexManagedProvider.ts, CodexInstallation.ts, CodexChatGptAuth.ts)
    () => gt("Codex is disabled in T3 Code settings."),
    () => gt("Codex provider status has not been checked in this session yet."),
    () => gt("Codex CLI is not authenticated. Run `codex login` and try again."),
    () => gt("Timed out while checking Codex app-server provider status."),
    () => gt("Codex did not return its model catalog in time."),
    () => gt("OpenAI API Key"),
    () => gt("ChatGPT Free Subscription"),
    () => gt("ChatGPT Go Subscription"),
    () => gt("ChatGPT Plus Subscription"),
    () => gt("ChatGPT Pro 200 Subscription"),
    () => gt("ChatGPT Pro 100 Subscription"),
    () => gt("ChatGPT Pro 500 Subscription"),
    () => gt("ChatGPT Business Premium Subscription"),
    () => gt("ChatGPT Business Subscription"),
    () => gt("ChatGPT Enterprise Subscription"),
    () => gt("ChatGPT Edu Subscription"),
    () => gt("ChatGPT Subscription"),
    () => gt("Set up Codex to get started."),
    () =>
      gt(
        "Signed in with ChatGPT, but token sharing is disabled. Sign in again and enable token sharing, or use another provider.",
      ),
    () => gt("Sign in with ChatGPT to use Codex."),
    () => gt("Could not check Codex right now. Retry, or reconnect in provider settings."),
    () => gt("The ChatGPT connection changed while checking Codex. Retry."),
    () => gt("Extracting Codex."),
    () => gt("Checking Codex."),
    () => gt("Downloading Codex."),
    () => gt("Could not finish the Codex installation. Check disk space and directory access."),
    () => gt("The managed Codex runtime is incomplete. Remove it and reinstall."),
    () => gt("The managed Codex installation record is invalid. Reinstall Codex."),
    () => gt("The downloaded Codex package does not match the expected release."),
    () => gt("The managed Codex package is incomplete. Reinstall Codex."),
    () => gt("The managed Codex installation record has the wrong version."),
    () => gt("Update the managed Codex installation to continue."),
    () => gt("Codex is not installed in T3 Code. Install it to continue."),
    () => gt("Could not unpack or start the downloaded Codex package."),
    () => gt("The downloaded Codex executable has the wrong version."),
    () => gt("The downloaded Codex runtime could not start."),
    () => gt("This Codex release was withdrawn. Check for updates and try again."),
    () =>
      gt(
        "The existing managed Codex release differs from the official package. Remove it and reinstall.",
      ),
    () => gt("The Codex download exceeded the expected release size."),
    () => gt("The Codex download timed out. Retry installation."),
    () => gt("The Codex download failed its size or SHA-256 check. Nothing was installed."),
    () => gt("The Codex archive contains unsafe entries."),
    () =>
      gt(
        "The Codex download was interrupted. Check your internet connection, then retry installation.",
      ),
    () => gt("Could not install Codex. Check disk space and directory access, then try again."),
    () => gt("The installed Codex runtime could not start. Remove it and reinstall."),
    () => gt("Could not start the Codex installation."),
    () => gt("Stop Codex sessions and sign-in flows before removing its managed runtime."),
    () =>
      gt(
        "A provider instance uses a custom path inside managed Codex. Clear that path before removing it.",
      ),
    () => gt("Could not remove the managed Codex runtime. Check for open processes and try again."),
    () => gt("Could not reach ChatGPT sign-in. Try again."),
    () => gt("ChatGPT sign-in configuration could not be verified."),
    () => gt("Could not read the saved ChatGPT connection."),
    () => gt("The saved ChatGPT connection is invalid. Sign in again."),
    () => gt("Could not save the ChatGPT connection."),
    () => gt("Could not clear the ChatGPT connection. Try again."),
    () => gt("ChatGPT sign-in is temporarily unavailable. Try again."),
    () => gt("ChatGPT did not accept this sign-in. Try again."),
    () => gt("Your ChatGPT connection expired or was disconnected. Sign in again."),
    () => gt("This sign-in code expired. Start again."),
    () => gt("ChatGPT sign-in was declined. Sign in again when you are ready."),
    () => gt("ChatGPT could not complete sign-in. Try again."),
    () => gt("ChatGPT returned an invalid token response. Sign in again."),
    () => gt("Could not start the local sign-in callback. Try again."),
    () => gt("Could not start the local sign-in callback."),
    () => gt("This redirect URL does not belong to the active ChatGPT sign-in."),
    () => gt("ChatGPT sign-in could not be completed."),
    () => gt("ChatGPT sign-in could not be verified. Start again."),
    () => gt("ChatGPT sign-in could not be completed. Start again."),
    () => gt("ChatGPT registration is incomplete. Start sign-in again."),
    () =>
      gt(
        "This sign-in returned a different ChatGPT account. Use the different-account sign-in option instead. Your saved connection is unchanged.",
      ),
    () =>
      gt(
        "Token sharing was not enabled for the new account. Your existing ChatGPT connection is unchanged.",
      ),
    () => gt("Sign in with ChatGPT to use managed Codex."),
    () => gt("The ChatGPT connection changed. Start a new session."),
    () => gt("Token sharing is disabled. Sign in with ChatGPT and enable token sharing."),
    () => gt("ChatGPT cannot renew this connection yet. Try again shortly."),
    () => gt("Your ChatGPT connection expired. Sign in again."),
    () => gt("Could not renew the ChatGPT connection. Retry, or sign in again."),
    () => gt("ChatGPT token sharing is no longer enabled. Sign in again."),
    () => gt("Could not remove the saved ChatGPT connection. Try again."),
    () =>
      gt(
        "Signed out locally. Remote revocation could not be confirmed. Disconnect the app in ChatGPT Settings.",
      ),
    () => gt("Sign in with ChatGPT"),
    () => gt("Use a different ChatGPT account"),
    () => gt("Register a connection for another ChatGPT account."),
    () => gt("Reuse this account's original sign-in registration."),
    // Claude (ClaudeProvider.ts)
    () => gt("Claude is disabled in T3 Code settings."),
    () => gt("Claude Agent CLI (`claude`) was not found on PATH."),
    () => gt("Failed to execute Claude Agent CLI health check."),
    () => gt("Claude Agent CLI is installed but failed to run. Timed out while running command."),
    () => gt("Claude Agent CLI is installed but failed to run."),
    () => gt("Claude Agent CLI failed while checking account status."),
    () => gt("Could not verify Claude authentication status from initialization result."),
    () => gt("Claude Code is not authenticated. Run `claude auth login` and try again."),
    () =>
      gt(
        "Claude could not authenticate. For subscription login, run `claude auth login` on this environment's machine, then start a new thread. For API-key authentication, check this instance's configured credentials.",
      ),
    () => gt("Claude provider status has not been checked in this session yet."),
    () => gt("Claude API Key"),
    () => gt("Custom API endpoint"),
    // Antigravity (AntigravityProvider.ts, antigravityAuthSupport.ts, AntigravityAuth.ts, AntigravityInstallation.ts)
    () => gt("Sign in with Google to use Antigravity."),
    () => gt("Antigravity is installed. Google account access is not checked yet."),
    () => gt("Checking Antigravity availability."),
    () => gt("Antigravity is disabled in T3 Code settings."),
    () => gt("Antigravity could not complete its local health check."),
    () => gt("Antigravity ACP runtime is not installed or its executable could not be found."),
    () => gt("Google account"),
    () => gt("Gemini API key"),
    () =>
      gt(
        "Gemini Enterprise needs a GCP project and location in the Antigravity provider settings.",
      ),
    () => gt("Enter a Gemini API key in the Antigravity provider settings."),
    () =>
      gt(
        "Agent Platform needs an API key, or a GCP project and location, in the Antigravity provider settings.",
      ),
    () => gt("Sign in to Antigravity in Settings before you continue."),
    () => gt("Could not refresh Antigravity models. The previous model list is unchanged."),
    () => gt("Antigravity model refresh timed out. Try again or check Google sign-in."),
    () => gt("Sign in to Antigravity in provider settings before refreshing models."),
    () =>
      gt(
        "Antigravity has not started after 90 seconds. Its runtime may be stuck starting on this machine.",
      ),
    () => gt("Antigravity did not respond. Its runtime may not run on this machine."),
    () =>
      gt(
        "Antigravity has not reached Google after 30 seconds. Check this machine's network connection. Broken IPv6 is a common cause.",
      ),
    () =>
      gt(
        "Antigravity could not reach Google. Check this machine's network connection, then start sign-in again.",
      ),
    () => gt("Could not deliver the sign-in response. Start sign-in again."),
    () => gt("Google requires an eligible Antigravity subscription for this account."),
    () => gt("Google sign-in was not approved. Start sign-in again."),
    () => gt("Antigravity authenticated, but could not initialize a session or load models."),
    () => gt("Antigravity rejected the configured credentials. Check the provider settings."),
    () => gt("Google sign-in failed. Start sign-in again."),
    () => gt("Antigravity could not authenticate with the configured credentials."),
    () => gt("Signed in with Google."),
    () => gt("Connected to Antigravity."),
    () => gt("Open the Google sign-in link. If you are remote, paste the redirect URL here."),
    () => gt("Checking Antigravity access and models."),
    () => gt("Starting Google sign-in."),
    () => gt("Checking credentials."),
    () => gt("Waiting for Google to finish sign-in."),
    () => gt("Google sign-in was cancelled."),
    () => gt("Google sign-in was cancelled by sign-out."),
    () => gt("Signed out of Google."),
    () => gt("Antigravity sign-out failed. Try again."),
    () => gt("Antigravity sign-in or sign-out is in progress. Try again after it finishes."),
    () => gt("Google sign-in expired. Start sign-in again."),
    () => gt("Antigravity setup is already in progress."),
    () => gt("Could not start Google sign-in. Try again."),
    () => gt("The sign-in response was already sent. Wait for Google to finish."),
    () => gt("Wait for the Google sign-in link before you send a redirect URL."),
    () => gt("Antigravity setup is already stopping."),
    () => gt("This Antigravity version does not support sign-out. Update the provider."),
    () => gt("Antigravity sign-out timed out."),
    () => gt("The sign-in response URL is too long."),
    () => gt("Paste the complete redirect URL from the Google sign-in page."),
    () => gt("This redirect URL does not belong to the current sign-in."),
    () => gt("The redirect URL must contain one Google sign-in response."),
    () => gt("The redirect URL is not a Google sign-in response."),
    () => gt("The sign-in response timed out. Start sign-in again."),
    () => gt("Checking the installed runtime."),
    () => gt("Extracting the verified runtime."),
    () => gt("Checking the downloaded runtime."),
    () => gt("Downloading Google's official Antigravity runtime."),
    () =>
      gt("Could not finish the Antigravity installation. Check disk space and directory access."),
    () => gt("The managed Antigravity runtime is incomplete. Remove it and reinstall."),
    () => gt("This Antigravity release was withdrawn. Check for updates and try again."),
    () => gt("The managed runtime record is invalid. Reinstall Antigravity."),
    () => gt("The managed Antigravity runtime is incomplete. Reinstall it."),
    () =>
      gt(
        "The custom Antigravity executable is missing or not executable, or it needs a localharness_external sibling. The agy CLI does not.",
      ),
    () =>
      gt(
        "Antigravity ACP runtime is not installed. Install it in this environment's provider settings or set a custom ACP executable path. The Antigravity app, IDE, and CLI are separate installations.",
      ),
    () =>
      gt(
        "Could not read the Antigravity installation. Reinstall it or set a custom executable path.",
      ),
    () =>
      gt(
        "Antigravity requires IPv6 socket support. Enable IPv6 in this environment. On WSL, remove ipv6.disable=1 from .wslconfig and run wsl --shutdown.",
      ),
    () => gt("The downloaded Antigravity runtime could not start in this environment."),
    () =>
      gt(
        "Could not activate Antigravity. The previous runtime is unchanged. Check for locked files and try again.",
      ),
    () => gt("Could not check free disk space."),
    () =>
      gt(
        "Could not download Antigravity from Google. Check the network connection and any proxy settings, then try again.",
      ),
    () => gt("The Antigravity download failed its size or checksum check. Nothing was installed."),
    () =>
      gt(
        "Could not install Antigravity. Check free disk space and directory access, then try again.",
      ),
    () =>
      gt(
        "Could not find a native Antigravity CLI release. Check the network connection and try again.",
      ),
    () => gt("Could not verify the installed Antigravity runtime."),
    () => gt("Could not start the Antigravity installation."),
    () => gt("Stop Antigravity sessions and sign-in flows before removing its managed runtime."),
    () =>
      gt(
        "A provider instance has a custom path inside this managed runtime. Clear that path before removing it.",
      ),
    () =>
      gt(
        "Could not remove the managed Antigravity runtime. Check for open processes and try again.",
      ),
    // Cursor (provider-cursor status.ts, auth.ts)
    () => gt("Cursor is disabled in T3 Code settings."),
    () => gt("Checking Cursor SDK availability..."),
    () => gt("Sign in with Cursor or add CURSOR_API_KEY in provider settings."),
    () => gt("Cursor SDK catalog request failed. Check server logs for details."),
    () => gt("Cursor sign-in expired or was rejected. Sign in again in provider settings."),
    () => gt("Cursor SDK authentication failed. Check CURSOR_API_KEY."),
    () =>
      gt(
        "Cursor needs a paid plan to run in T3 Code. Upgrade this account or sign in with a different one.",
      ),
    () =>
      gt(
        "Cursor needs a paid plan to run in T3 Code. Upgrade the account that owns CURSOR_API_KEY or use a key from a paid account.",
      ),
    () => gt("Cursor SDK model discovery returned no built-in models."),
    () => gt("Cursor account"),
    () => gt("Cursor API key"),
    () =>
      gt("Open the Cursor sign-in page and finish signing in. This page updates automatically."),
    () => gt("Checking Cursor sign-in."),
    () => gt("Signed in with Cursor."),
    () => gt("Cursor sign-in failed or expired. Start sign-in again."),
    () => gt("Starting Cursor sign-in."),
    () => gt("Cursor sign-in was cancelled."),
    () => gt("Signed out of Cursor."),
    () => gt("Cursor sign-out failed. Try again."),
    () =>
      gt(
        "Cursor signed you in but could not create an API key. Your team's settings may restrict API keys: ask a team admin, or add CURSOR_API_KEY in provider settings.",
      ),
    () =>
      gt(
        "Cursor sign-in failed or timed out. Check that this machine can reach Cursor, then start sign-in again.",
      ),
    () => gt("Cursor sign-in failed. Start sign-in again."),
    () => gt("Could not read the Cursor sign-in. Try signing in again."),
    () => gt("Cursor sign-in or sign-out is in progress. Try again after it finishes."),
    () => gt("Could not load the Cursor SDK. Try signing in again."),
    () => gt("Could not save the Cursor sign-in. Try again."),
    () => gt("Cursor sign-in expired. Start sign-in again."),
    () => gt("Enable Cursor before signing in."),
    () =>
      gt("Remove CURSOR_API_KEY from this provider's environment before using browser sign-in."),
    () => gt("Cursor setup is already in progress."),
    () => gt("Could not start Cursor sign-in. Try again."),
    () => gt("Finish signing in on the Cursor website. No redirect URL is needed."),
    () => gt("Remove CURSOR_API_KEY from this provider's environment to disconnect it."),
    () => gt("Cursor setup is already stopping."),
    () => gt("Could not clear the Cursor sign-in. Try again."),
    () => gt("Could not verify the Cursor sign-in. Try again."),
    () => gt("Sign in with Cursor"),
    // OpenCode (provider-opencode status.ts)
    () => gt("OpenCode server rejected authentication. Check the server URL and password."),
    () => gt("Failed to connect to the configured OpenCode server."),
    () => gt("OpenCode CLI (`opencode`) is not installed or not on PATH."),
    () =>
      gt(
        "macOS is blocking the OpenCode binary (quarantine). Run `xattr -d com.apple.quarantine $(which opencode)` to fix this.",
      ),
    () =>
      gt(
        "macOS killed the OpenCode process due to an invalid code signature. The binary may be corrupted. Try reinstalling OpenCode.",
      ),
    () => gt("Failed to load OpenCode provider inventory."),
    () => gt("Failed to execute OpenCode CLI health check."),
    () => gt("OpenCode is disabled in T3 Code settings. A server URL is configured."),
    () => gt("OpenCode is disabled in T3 Code settings."),
    () => gt("OpenCode provider status has not been checked in this session yet."),
    () => gt("OpenCode could not load its model list."),
    () => gt("OpenCode 2 is running, but it did not list any models yet."),
    () => gt("OpenCode upstream providers are connected, but it did not list any models yet."),
    () =>
      gt(
        "Connected to the configured OpenCode server, but it did not report any connected upstream providers.",
      ),
    () => gt("OpenCode is available, but it did not report any connected upstream providers."),
    () => gt("The OpenCode server URL is not a valid http:// or https:// URL."),
    () => gt("Couldn't reach the OpenCode server."),
    () => gt("Timed out while checking the OpenCode server version."),
    () => gt("401 Unauthorized: the OpenCode server rejected the password."),
    () => gt("OpenCode provider list was empty."),
    () => gt("Could not reach the OpenCode server."),
    () => gt("The OpenCode server rejected the server password."),
    () => gt("The server is not an OpenCode 2 server."),
    () => gt("Timed out waiting for the OpenCode server."),
    // Grok, Kiro, Pi, fx, Muse (provider-*/src/server/status.ts)
    () => gt("Grok is disabled in T3 Code settings."),
    () => gt("Checking Grok CLI availability..."),
    () => gt("Grok CLI (`grok`) is not installed or not on PATH."),
    () => gt("Failed to execute Grok CLI health check."),
    () => gt("Grok CLI is installed but timed out while running `grok --version`."),
    () => gt("Grok CLI is installed but failed to run."),
    () => gt("Grok CLI is installed but ACP initialize failed. Model options may be incomplete."),
    () => gt("Grok CLI did not list any models. Model options may be incomplete."),
    () => gt("Grok CLI is installed but not logged in. Run `grok login`."),
    () => gt("xAI API key"),
    () => gt("Grok account"),
    () => gt("Checking Kiro CLI availability..."),
    () => gt("Kiro is disabled in T3 Code settings."),
    () => gt("Kiro CLI (`kiro-cli`) is not installed or not on PATH."),
    () => gt("Failed to run `kiro-cli --version`."),
    () => gt("Kiro CLI is installed but failed to run."),
    () => gt("Kiro CLI is installed but not signed in. Run `kiro-cli login`."),
    () => gt("Could not confirm the Kiro sign-in. Run `kiro-cli whoami` to check."),
    () => gt("Kiro API key"),
    () => gt("Kiro account"),
    () => gt("Pi is disabled in T3 Code settings."),
    () => gt("Checking Pi CLI availability..."),
    () =>
      gt(
        "Pi CLI (`pi`) is not installed or not on PATH. Install with `npm install -g --ignore-scripts @earendil-works/pi-coding-agent`.",
      ),
    () => gt("Failed to execute Pi CLI health check."),
    () => gt("Pi CLI is installed but timed out while running `pi --version`."),
    () => gt("Pi CLI is installed but failed to run."),
    () =>
      gt(
        "Pi is available, but T3 Code could not refresh its models and commands. The live session will retry startup.",
      ),
    () =>
      gt(
        "Pi is available, but model and command discovery needs interactive input. The live session will handle it.",
      ),
    () =>
      gt(
        "Pi has no usable models. Run `pi` in a terminal and use /login, or configure an API key in ~/.pi/agent.",
      ),
    () => gt("Checking fx CLI availability..."),
    () => gt("fx is disabled in T3 Code settings."),
    () => gt("fx is not installed or not on PATH."),
    () => gt("Failed to run `fx --version`."),
    () => gt("fx is installed but failed to run."),
    () => gt("Run `fx login` to sign in."),
    () => gt("fx is installed but login state could not be determined."),
    () => gt("fx is installed but model listing failed. Model options may be incomplete."),
    () => gt("Checking Muse Code CLI availability..."),
    () => gt("Muse Code is disabled in T3 Code settings."),
    () =>
      gt(
        "Muse Code CLI (`muse`) was not found. Install Muse Code and run `muse login` on this T3 server host.",
      ),
    () => gt("Failed to execute Muse Code CLI. Check its binary path on this T3 server host."),
    () => gt("Muse Code CLI version check timed out."),
    () =>
      gt(
        "Muse Code has not finished installing. Run `muse --version` on this T3 server host, then refresh its status.",
      ),
    () => gt("Muse Code CLI is installed but failed to run."),
    () =>
      gt(
        "Muse Code SDK could not read the model catalog. Check your Muse installation and run `muse login` on this T3 server host.",
      ),
    () =>
      gt(
        "Muse Code returned no models. Run `muse login` on this T3 server host and refresh its status.",
      ),
    // ACP Registry (provider-acp-registry driver.ts, probe.ts, auth.ts)
    () =>
      gt(
        "Select an ACP Registry agent or configure a local ACP executable before starting a thread.",
      ),
    () => gt("Local ACP executable is not available on this environment's PATH."),
    () => gt("Checking ACP Registry agent readiness..."),
    () => gt("ACP Registry is disabled in T3 Code settings."),
    () => gt("Checking ACP authentication, models, and commands in the background..."),
    () => gt("ACP Registry returned invalid JSON."),
    () => gt("The ACP agent could not complete authentication."),
    () => gt("The ACP agent could not create a test session."),
    () => gt("Could not prepare the selected ACP agent."),
    () => gt("Could not start the selected ACP agent."),
    () => gt("Could not inspect the selected ACP agent."),
    () => gt("Prepare this ACP agent before signing in."),
    () => gt("Could not discover this agent's sign-in methods."),
    () => gt("The ACP agent did not advertise sign-in methods in time."),
    () => gt("Sign-in discovery was interrupted by an active provider session. Try again."),
    () => gt("Interactive provider login is unavailable on this environment."),
    () => gt("Could not open the provider sign-in terminal."),
    () => gt("The provider sign-in terminal is no longer available."),
    () => gt("The provider login command did not finish successfully."),
    () => gt("Enable this provider before signing in."),
    () => gt("Could not initialize the selected ACP agent."),
    () => gt("The agent no longer advertises this sign-in method."),
    () => gt("The provider could not create a session after terminal sign-in."),
    () => gt("This runtime does not support explicit ACP sign-in."),
    () => gt("The ACP agent could not complete sign-in."),
    () => gt("The provider could not create a session after sign-in."),
    () => gt("This ACP agent could not sign out. It may not advertise logout support."),
    () => gt("The ACP agent did not finish signing out in time."),
    // Pieces of composed messages
    () => gt("Local device support"),
    () => gt("Device automation"),
    () => gt("Antigravity sign-in"),
    () => gt("Installing ChatGPT or Codex desktop may not add codex to PATH."),
    () => gt("Make sure the configured executable exists and can be run."),
    () => gt("the installed version"),
    () => gt("1 upstream provider connected through OpenCode."),
    () => gt("1 upstream provider connected through the configured OpenCode server."),
  ];
}

const englishOnly = ((message: string) => message) as unknown as Translate;
const exactIndex = new Map(exactMessages(englishOnly).map((message, index) => [message(), index]));

const DURATION_TOKEN = /(\d+(?:\.\d+)?)(ms|[dhms])/g;
const DURATION_SOURCE = String.raw`\d+(?:\.\d+)?(?:ms|[dhms])(?: \d+(?:\.\d+)?(?:ms|[dhms]))*`;
const DURATION = new RegExp(`^${DURATION_SOURCE}$`);
const COUNT_NOUN = String.raw`\d+ (?:subagents?|commands?|monitors?|background tasks?)`;
const BACKGROUND_GROUPS = new RegExp(
  String.raw`^(Waiting on|Running) (${COUNT_NOUN}(?:(?:, | and )${COUNT_NOUN})*)$`,
);
const SUBAGENT_STATUS = "(Idle|Working|Waiting|Completed|Interrupted|Failed|Cancelled)";

/** Durations from `formatDuration` ("1h 5m", "4.2s", "3d 2h"); anything else is returned as is. */
export function localizeDuration(text: string, gt: Translate): string {
  if (!DURATION.test(text)) return text;
  return text.replace(DURATION_TOKEN, (_, value: string, unit: string) => {
    switch (unit) {
      case "ms":
        return gt("{value}ms", { value });
      case "s":
        return gt("{value}s", { value });
      case "m":
        return gt("{value}m", { value });
      case "h":
        return gt("{value}h", { value });
      default:
        return gt("{value}d", { value });
    }
  });
}

const at = (match: RegExpExecArray, index: number) => match[index] ?? "";

const TEMPLATES: ReadonlyArray<Template> = [
  // Connection diagnosis (client-runtime/connection/diagnosis.ts)
  [
    /^(.+) is waiting for someone to approve this device$/,
    (gt, m) => gt("{host} is waiting for someone to approve this device", { host: at(m, 1) }),
  ],
  [
    /^(.+) runs an older T3 Code$/,
    (gt, m) => gt("{host} runs an older T3 Code", { host: at(m, 1) }),
  ],
  [
    /^(.+) is not linked to your T3 Connect account$/,
    (gt, m) => gt("{host} is not linked to your T3 Connect account", { host: at(m, 1) }),
  ],
  [
    /^(.+)'s tunnel is still being set up$/,
    (gt, m) => gt("{host}'s tunnel is still being set up", { host: at(m, 1) }),
  ],
  [
    /^T3 Connect is not turned on for (.+)$/,
    (gt, m) => gt("T3 Connect is not turned on for {host}", { host: at(m, 1) }),
  ],
  [/^(.+)'s tunnel is offline$/, (gt, m) => gt("{host}'s tunnel is offline", { host: at(m, 1) })],
  [
    /^Tunnel works, but T3 Code on (.+) did not answer$/,
    (gt, m) => gt("Tunnel works, but T3 Code on {host} did not answer", { host: at(m, 1) }),
  ],
  [
    /^T3 Code on (.+) sent an unexpected answer$/,
    (gt, m) => gt("T3 Code on {host} sent an unexpected answer", { host: at(m, 1) }),
  ],
  [
    /^(.+)'s tunnel address did not resolve$/,
    (gt, m) => gt("{host}'s tunnel address did not resolve", { host: at(m, 1) }),
  ],
  [
    /^Secure connection to (.+)'s tunnel failed$/,
    (gt, m) => gt("Secure connection to {host}'s tunnel failed", { host: at(m, 1) }),
  ],
  [
    /^(.+)'s tunnel refused the connection$/,
    (gt, m) => gt("{host}'s tunnel refused the connection", { host: at(m, 1) }),
  ],
  [
    /^(.+) did not answer in time$/,
    (gt, m) => gt("{host} did not answer in time", { host: at(m, 1) }),
  ],
  [
    /^This device can't reach (.+)'s tunnel$/,
    (gt, m) => gt("This device can't reach {host}'s tunnel", { host: at(m, 1) }),
  ],
  [
    /^T3 Connect could not reach (.+)'s tunnel$/,
    (gt, m) => gt("T3 Connect could not reach {host}'s tunnel", { host: at(m, 1) }),
  ],
  [
    /^T3 Code on (.+) did not accept this device$/,
    (gt, m) => gt("T3 Code on {host} did not accept this device", { host: at(m, 1) }),
  ],
  [
    /^T3 Code on (.+) did not answer$/,
    (gt, m) => gt("T3 Code on {host} did not answer", { host: at(m, 1) }),
  ],
  [
    /^On (.+), check Settings > Sharing & access or run `t3 connect status`\.$/,
    (gt, m) =>
      gt("On {host}, check Settings > Sharing & access or run `t3 connect status`.", {
        host: at(m, 1),
      }),
  ],
  [
    /^On a device already connected to (.+), open Settings > Sharing & access and approve the device showing (.+)\.$/,
    (gt, m) =>
      gt(
        "On a device already connected to {host}, open Settings > Sharing & access and approve the device showing {code}.",
        { host: at(m, 1), code: at(m, 2) },
      ),
  ],
  [
    /^On a device already connected to (.+), open Settings > Sharing & access and approve this device\.$/,
    (gt, m) =>
      gt(
        "On a device already connected to {host}, open Settings > Sharing & access and approve this device.",
        { host: at(m, 1) },
      ),
  ],
  [
    /^Or run `t3 auth connect-device approve (.+)` on (.+)\.$/,
    (gt, m) =>
      gt("Or run `t3 auth connect-device approve {code}` on {host}.", {
        code: at(m, 1),
        host: at(m, 2),
      }),
  ],
  [/^Update T3 Code on (.+)\.$/, (gt, m) => gt("Update T3 Code on {host}.", { host: at(m, 1) })],
  [
    /^Turn on automatic date and time on this device and on (.+), then retry\.$/,
    (gt, m) =>
      gt("Turn on automatic date and time on this device and on {host}, then retry.", {
        host: at(m, 1),
      }),
  ],
  [
    /^On (.+), open Settings > Sharing & access and turn T3 Connect on\.$/,
    (gt, m) =>
      gt("On {host}, open Settings > Sharing & access and turn T3 Connect on.", {
        host: at(m, 1),
      }),
  ],
  [
    /^Make sure (.+) is awake and T3 Code is running on it\.$/,
    (gt, m) => gt("Make sure {host} is awake and T3 Code is running on it.", { host: at(m, 1) }),
  ],
  [
    /^A VPN or Tailscale exit node on (.+) can block the tunnel \(port 7844\)\. Turn it off or allow the tunnel\.$/,
    (gt, m) =>
      gt(
        "A VPN or Tailscale exit node on {host} can block the tunnel (port 7844). Turn it off or allow the tunnel.",
        { host: at(m, 1) },
      ),
  ],
  [
    /^Open or restart T3 Code on (.+)\.$/,
    (gt, m) => gt("Open or restart T3 Code on {host}.", { host: at(m, 1) }),
  ],
  [
    /^Make sure (.+) is awake and online\.$/,
    (gt, m) => gt("Make sure {host} is awake and online.", { host: at(m, 1) }),
  ],
  [
    /^If it keeps failing, remove (.+) from this device and add it again\.$/,
    (gt, m) =>
      gt("If it keeps failing, remove {host} from this device and add it again.", {
        host: at(m, 1),
      }),
  ],
  [
    /^Make sure T3 Code is running on (.+)\.$/,
    (gt, m) => gt("Make sure T3 Code is running on {host}.", { host: at(m, 1) }),
  ],

  // Relay (client-runtime/relay/errorPresentation.ts)
  [
    /^Relay rejected the environment link proof \((.+)\)\.$/,
    (gt, m) => gt("Relay rejected the environment link proof ({reason}).", { reason: at(m, 1) }),
  ],
  [
    /^Relay rejected the environment connection request \((.+)\)\.$/,
    (gt, m) =>
      gt("Relay rejected the environment connection request ({reason}).", { reason: at(m, 1) }),
  ],
  [
    /^Relay could not reach the environment endpoint \((.+)\)\.$/,
    (gt, m) =>
      gt("Relay could not reach the environment endpoint ({reason}).", { reason: at(m, 1) }),
  ],
  [
    /^Relay could not link the environment \((.+)\)\.$/,
    (gt, m) => gt("Relay could not link the environment ({reason}).", { reason: at(m, 1) }),
  ],
  [
    /^Relay cannot provision the managed endpoint \((.+)\)\.$/,
    (gt, m) => gt("Relay cannot provision the managed endpoint ({reason}).", { reason: at(m, 1) }),
  ],
  [/^Failed stage: (.+)\.$/, (gt, m) => gt("Failed stage: {stage}.", { stage: at(m, 1) })],
  [
    /^Relay refused the link: this account already has its maximum of (\d+) managed tunnels\. Unlink an environment, or link a paid T3 Chat account in your T3 Connect account settings on web or desktop\. Pro raises the default limit to (\d+) and Premier to (\d+)\.$/,
    (gt, m) =>
      gt(
        "Relay refused the link: this account already has its maximum of {max} managed tunnels. Unlink an environment, or link a paid T3 Chat account in your T3 Connect account settings on web or desktop. Pro raises the default limit to {pro} and Premier to {premier}.",
        { max: at(m, 1), pro: at(m, 2), premier: at(m, 3) },
      ),
  ],
  [
    /^Relay refused the link: this account already has its maximum of (\d+) managed tunnels\. Unlink an environment to free one up\.$/,
    (gt, m) =>
      gt(
        "Relay refused the link: this account already has its maximum of {max} managed tunnels. Unlink an environment to free one up.",
        { max: at(m, 1) },
      ),
  ],
  [
    /^Relay rejected the agent activity publish proof \((.+)\)\.$/,
    (gt, m) =>
      gt("Relay rejected the agent activity publish proof ({reason}).", { reason: at(m, 1) }),
  ],
  [
    /^Relay encountered an internal error \((.+)\)\.$/,
    (gt, m) => gt("Relay encountered an internal error ({reason}).", { reason: at(m, 1) }),
  ],
  [
    /^Relay returned an unexpected HTTP (\d+)\.$/,
    (gt, m) => gt("Relay returned an unexpected HTTP {status}.", { status: at(m, 1) }),
  ],

  // Device stream (client-runtime/device/stream.ts)
  [
    /^This browser cannot decode this device's (\S+) stream\.$/,
    (gt, m) => gt("This browser cannot decode this device's {codec} stream.", { codec: at(m, 1) }),
  ],
  [
    /^This browser cannot decode the Duo panel's (\S+) stream\.$/,
    (gt, m) =>
      gt("This browser cannot decode the Duo panel's {codec} stream.", { codec: at(m, 1) }),
  ],
  [
    /^This browser cannot decode (\S+)\.$/,
    (gt, m) => gt("This browser cannot decode {codec}.", { codec: at(m, 1) }),
  ],
  [/^Video decoder: (.+)$/, (gt, m) => gt("Video decoder: {detail}", { detail: at(m, 1) })],
  [
    /^Device lease ended: (.+)$/,
    (gt, m) => gt("Device lease ended: {reason}", { reason: at(m, 1) }),
  ],

  // Thread execution (client-runtime/state/threadExecution.ts)
  [/^Starting ([^.…]+)$/, (gt, m) => gt("Starting {provider}", { provider: at(m, 1) })],
  [
    new RegExp(`^${SUBAGENT_STATUS} in (${DURATION_SOURCE})$`),
    (gt, m) =>
      gt("{status} in {duration}", {
        status: localizeExternalMessage(at(m, 1), gt),
        duration: localizeDuration(at(m, 2), gt),
      }),
  ],
  [
    new RegExp(`^${SUBAGENT_STATUS} (${DURATION_SOURCE})$`),
    (gt, m) => `${localizeExternalMessage(at(m, 1), gt)} ${localizeDuration(at(m, 2), gt)}`,
  ],
  [
    /^(\d+(?:\.\d+)?[km]?) \/ (\d+(?:\.\d+)?[km]?) tokens$/,
    (gt, m) => gt("{used} / {budget} tokens", { used: at(m, 1), budget: at(m, 2) }),
  ],
  [/^(\d+(?:\.\d+)?[km]?) tokens$/, (gt, m) => gt("{tokens} tokens", { tokens: at(m, 1) })],
  [/^(\d+) checks$/, (gt, m) => gt("{count} checks", { count: at(m, 1) })],
  [/^(\d+) subagents$/, (gt, m) => gt("{count} subagents", { count: at(m, 1) })],
  [/^(\d+) commands$/, (gt, m) => gt("{count} commands", { count: at(m, 1) })],
  [/^(\d+) monitors$/, (gt, m) => gt("{count} monitors", { count: at(m, 1) })],
  [/^(\d+) background tasks$/, (gt, m) => gt("{count} background tasks", { count: at(m, 1) })],
  [
    BACKGROUND_GROUPS,
    (gt, m) => {
      const items = at(m, 2)
        .split(/, | and /)
        .map((group) => localizeExternalMessage(group, gt))
        .join("、");
      return at(m, 1) === "Waiting on"
        ? gt("Waiting on {items}", { items })
        : gt("Running {items}", { items });
    },
  ],
  [/^Waiting · (.+)$/, (gt, m) => gt("Waiting · {label}", { label: at(m, 1) })],
  [/^Running · (.+)$/, (gt, m) => gt("Running · {label}", { label: at(m, 1) })],

  // Usage limits (shared/usageLimits.ts)
  [
    /^resets in (.+)$/,
    (gt, m) => gt("resets in {duration}", { duration: localizeDuration(at(m, 1), gt) }),
  ],
  [
    /^(\d+) reset credits banked$/,
    (gt, m) => gt("{count} reset credits banked", { count: at(m, 1) }),
  ],
  [/^(\d+) banked$/, (gt, m) => gt("{count} banked", { count: at(m, 1) })],
  [/^(\d+) left$/, (gt, m) => gt("{count} left", { count: at(m, 1) })],
  [
    new RegExp(`^in (${DURATION_SOURCE})$`),
    (gt, m) => gt("in {duration}", { duration: localizeDuration(at(m, 1), gt) }),
  ],
  [new RegExp(`^↻ (${DURATION_SOURCE})$`), (gt, m) => `↻ ${localizeDuration(at(m, 1), gt)}`],
  [
    /^next expires in (.+)$/,
    (gt, m) => gt("next expires in {duration}", { duration: localizeDuration(at(m, 1), gt) }),
  ],
  [
    /^expires in (.+)$/,
    (gt, m) => gt("expires in {duration}", { duration: localizeDuration(at(m, 1), gt) }),
  ],

  // Terminals (shared/terminalLabels.ts)
  [/^Terminal (\d+)$/, (gt, m) => gt("Terminal {number}", { number: at(m, 1) })],

  // Provider status, shared (contracts settings.ts, shared nodeRuntime.ts, provider-core, apps/server)
  [
    /^Your organization policy does not allow the (.+) provider\.$/,
    (gt, m) =>
      gt("Your organization policy does not allow the {provider} provider.", {
        provider: at(m, 1),
      }),
  ],
  [
    /^(.+)'s policy does not allow the (.+) provider\.$/,
    (gt, m) =>
      gt("{organization}'s policy does not allow the {provider} provider.", {
        organization: at(m, 1),
        provider: at(m, 2),
      }),
  ],
  [
    /^(.+) requires Node\.js\. Install Node\.js and make sure node is on PATH, then retry\.$/,
    (gt, m) =>
      gt("{feature} requires Node.js. Install Node.js and make sure node is on PATH, then retry.", {
        feature: localizeExternalMessage(at(m, 1), gt),
      }),
  ],
  [
    /^Version (\S+) is out\. T3 Code runs (.+); update it with the app or tool that installed it\.$/,
    (gt, m) =>
      gt(
        "Version {version} is out. T3 Code runs {path}; update it with the app or tool that installed it.",
        { version: at(m, 1), path: at(m, 2) },
      ),
  ],
  [
    /^Version (\S+) is out\. Update it with the app or tool that installed it\.$/,
    (gt, m) =>
      gt("Version {version} is out. Update it with the app or tool that installed it.", {
        version: at(m, 1),
      }),
  ],
  [
    /^Driver '(.+)' is not registered in this build\.$/,
    (gt, m) => gt("Driver ''{driver}'' is not registered in this build.", { driver: at(m, 1) }),
  ],
  [
    /^Could not read (.+) from its secret provider\. Unlock it, then refresh\.$/,
    (gt, m) =>
      gt("Could not read {secrets} from its secret provider. Unlock it, then refresh.", {
        secrets: at(m, 1),
      }),
  ],
  [
    /^Use ([v<>=^~\d][^ ]*(?: [<>=^~\d|][^ ]*)*)\.$/,
    (gt, m) => gt("Use {recommendation}.", { recommendation: at(m, 1) }),
  ],
  [
    /^Homebrew's local package metadata may be stale\. Run brew update && (.+) on this environment's host, then refresh provider status\.$/,
    (gt, m) =>
      gt(
        "Homebrew's local package metadata may be stale. Run brew update && {command} on this environment's host, then refresh provider status.",
        { command: at(m, 1) },
      ),
  ],
  [
    /^Update timed out after (\d+) minutes\.$/,
    (gt, m) => gt("Update timed out after {minutes} minutes.", { minutes: at(m, 1) }),
  ],
  [
    /^Update command exited with code (-?\d+)\.$/,
    (gt, m) => gt("Update command exited with code {code}.", { code: at(m, 1) }),
  ],
  [
    /^Update command exited with code (-?\d+): (.+)$/,
    (gt, m) =>
      gt("Update command exited with code {code}: {reason}", { code: at(m, 1), reason: at(m, 2) }),
  ],
  [
    /^Update command failed: (.+)$/,
    (gt, m) => gt("Update command failed: {reason}", { reason: at(m, 1) }),
  ],

  // Codex
  [
    /^Codex CLI is not authenticated\. Run `codex login` with CODEX_HOME set to (.+) and try again\.$/,
    (gt, m) =>
      gt(
        "Codex CLI is not authenticated. Run `codex login` with CODEX_HOME set to {path} and try again.",
        { path: at(m, 1) },
      ),
  ],
  [
    /^Codex app-server provider probe failed: (.+)\.$/,
    (gt, m) => gt("Codex app-server provider probe failed: {error}.", { error: at(m, 1) }),
  ],
  [
    /^Could not start Codex CLI \(`(.+)`\)\. Check Settings → Providers → Codex → Binary path on the server\.$/,
    (gt, m) =>
      gt(
        "Could not start Codex CLI (`{binary}`). Check Settings → Providers → Codex → Binary path on the server.",
        { binary: at(m, 1) },
      ),
  ],
  [
    /^The Codex download server returned HTTP (\d+)\. Try again later\.$/,
    (gt, m) =>
      gt("The Codex download server returned HTTP {status}. Try again later.", {
        status: at(m, 1),
      }),
  ],
  [
    /^OpenAI does not publish a Codex runtime for (\S+)\. Use a supported remote environment or a custom executable\.$/,
    (gt, m) =>
      gt(
        "OpenAI does not publish a Codex runtime for {platform}. Use a supported remote environment or a custom executable.",
        { platform: at(m, 1) },
      ),
  ],
  [/^Reconnect (\S+@\S+)\.$/, (gt, m) => gt("Reconnect {email}.", { email: at(m, 1) })],

  // Claude
  [
    /^Timed out after (\d+(?:\.\d+)?)s while checking Claude account status\.$/,
    (gt, m) =>
      gt("Timed out after {seconds}s while checking Claude account status.", {
        seconds: at(m, 1),
      }),
  ],
  [
    /^Claude could not authenticate\. For subscription login, run `claude auth login` on this environment's machine from (.+), with CLAUDE_CONFIG_DIR set to (.+), then start a new thread\. For API-key authentication, check this instance's configured credentials\.$/,
    (gt, m) =>
      gt(
        "Claude could not authenticate. For subscription login, run `claude auth login` on this environment's machine from {cwd}, with CLAUDE_CONFIG_DIR set to {configDir}, then start a new thread. For API-key authentication, check this instance's configured credentials.",
        { cwd: at(m, 1), configDir: at(m, 2) },
      ),
  ],
  [
    /^Claude Code (.+) is too old for (.+)\. Upgrade to v(\S+) or newer to access it\.$/,
    (gt, m) =>
      gt(
        "Claude Code {version} is too old for {model}. Upgrade to v{minVersion} or newer to access it.",
        {
          version: localizeExternalMessage(at(m, 1), gt),
          model: at(m, 2),
          minVersion: at(m, 3),
        },
      ),
  ],
  [/^Claude (\S+) Subscription$/, (gt, m) => gt("Claude {plan} Subscription", { plan: at(m, 1) })],
  [/^(\S+) Subscription$/, (gt, m) => gt("{plan} Subscription", { plan: at(m, 1) })],

  // Antigravity
  [
    /^Connect with (.+) to use Antigravity and load models\.$/,
    (gt, m) =>
      gt("Connect with {method} to use Antigravity and load models.", {
        method: localizeExternalMessage(at(m, 1), gt),
      }),
  ],
  [
    /^Antigravity is installed\. Connect with (.+) to load models\.$/,
    (gt, m) =>
      gt("Antigravity is installed. Connect with {method} to load models.", {
        method: localizeExternalMessage(at(m, 1), gt),
      }),
  ],
  [
    /^Antigravity did not respond to its local health check within (\d+(?:\.\d+)?) seconds\.$/,
    (gt, m) =>
      gt("Antigravity did not respond to its local health check within {seconds} seconds.", {
        seconds: at(m, 1),
      }),
  ],
  [
    /^Antigravity (\S+) no longer works with this T3 Code release\. Update it in Antigravity setup\.$/,
    (gt, m) =>
      gt(
        "Antigravity {version} no longer works with this T3 Code release. Update it in Antigravity setup.",
        { version: at(m, 1) },
      ),
  ],
  [
    /^Google does not publish an Antigravity runtime for (\S+)\. Use a supported environment or a custom executable\.$/,
    (gt, m) =>
      gt(
        "Google does not publish an Antigravity runtime for {platform}. Use a supported environment or a custom executable.",
        { platform: at(m, 1) },
      ),
  ],
  [
    /^Google does not publish an Antigravity runtime for (\S+)\. Use a supported remote environment or a custom executable\.$/,
    (gt, m) =>
      gt(
        "Google does not publish an Antigravity runtime for {platform}. Use a supported remote environment or a custom executable.",
        { platform: at(m, 1) },
      ),
  ],
  [
    /^Antigravity needs at least (\d+) MiB of free space to install\.$/,
    (gt, m) =>
      gt("Antigravity needs at least {size} MiB of free space to install.", { size: at(m, 1) }),
  ],

  // Cursor
  [
    /^Cursor SDK catalog request timed out after (\d+)ms\.$/,
    (gt, m) => gt("Cursor SDK catalog request timed out after {ms}ms.", { ms: at(m, 1) }),
  ],
  [/^Cursor API key \((.+)\)$/, (gt, m) => gt("Cursor API key ({name})", { name: at(m, 1) })],

  // OpenCode
  [
    /^Couldn't reach the configured OpenCode server at (.+)\. Check that the server is running and the URL is correct\.$/,
    (gt, m) =>
      gt(
        "Couldn't reach the configured OpenCode server at {url}. Check that the server is running and the URL is correct.",
        { url: at(m, 1) },
      ),
  ],
  [
    /^Failed to load OpenCode provider inventory: (.+)$/,
    (gt, m) =>
      gt("Failed to load OpenCode provider inventory: {detail}", {
        detail: localizeExternalMessage(at(m, 1), gt),
      }),
  ],
  [
    /^Failed to execute OpenCode CLI health check: (.+)$/,
    (gt, m) =>
      gt("Failed to execute OpenCode CLI health check: {detail}", {
        detail: localizeExternalMessage(at(m, 1), gt),
      }),
  ],
  [
    /^OpenCode (\S+) lists 1 model\.$/,
    (gt, m) => gt("OpenCode {version} lists 1 model.", { version: at(m, 1) }),
  ],
  [
    /^OpenCode (\S+) lists (\d+) models\.$/,
    (gt, m) =>
      gt("OpenCode {version} lists {count} models.", { version: at(m, 1), count: at(m, 2) }),
  ],
  [
    /^OpenCode v(\S+) is too old\. Upgrade to v(\S+) or newer\.$/,
    (gt, m) =>
      gt("OpenCode v{version} is too old. Upgrade to v{minVersion} or newer.", {
        version: at(m, 1),
        minVersion: at(m, 2),
      }),
  ],
  [
    /^(\d+) upstream providers connected through OpenCode\.$/,
    (gt, m) => gt("{count} upstream providers connected through OpenCode.", { count: at(m, 1) }),
  ],
  [
    /^(\d+) upstream providers connected through the configured OpenCode server\.$/,
    (gt, m) =>
      gt("{count} upstream providers connected through the configured OpenCode server.", {
        count: at(m, 1),
      }),
  ],
  [
    /^OpenCode CLI version probe timed out after (\d+(?:\.\d+)?) seconds\.$/,
    (gt, m) =>
      gt("OpenCode CLI version probe timed out after {seconds} seconds.", { seconds: at(m, 1) }),
  ],
  [
    /^The OpenCode server returned HTTP (\d+)\.$/,
    (gt, m) => gt("The OpenCode server returned HTTP {status}.", { status: at(m, 1) }),
  ],

  // Pi
  [
    /^T3 Code could not determine the Pi version\. Pi (\S+) or newer is required\.$/,
    (gt, m) =>
      gt("T3 Code could not determine the Pi version. Pi {minVersion} or newer is required.", {
        minVersion: at(m, 1),
      }),
  ],
  [
    /^Pi (\S+) is unsupported\. Update to Pi (\S+) or newer\.$/,
    (gt, m) =>
      gt("Pi {version} is unsupported. Update to Pi {minVersion} or newer.", {
        version: at(m, 1),
        minVersion: at(m, 2),
      }),
  ],

  // ACP Registry
  [
    /^ACP Registry does not contain agent '(.+)'\.$/,
    (gt, m) => gt("ACP Registry does not contain agent ''{agent}''.", { agent: at(m, 1) }),
  ],
  [
    /^ACP Registry agent '(.+)' has no compatible distribution for this environment\.$/,
    (gt, m) =>
      gt("ACP Registry agent ''{agent}'' has no compatible distribution for this environment.", {
        agent: at(m, 1),
      }),
  ],
  [
    /^ACP executable '(.+)' is not available on this environment's PATH\.$/,
    (gt, m) =>
      gt("ACP executable ''{runner}'' is not available on this environment's PATH.", {
        runner: at(m, 1),
      }),
  ],
  [
    /^ACP Registry agent '(.+)' has not been prepared on this environment\.$/,
    (gt, m) =>
      gt("ACP Registry agent ''{agent}'' has not been prepared on this environment.", {
        agent: at(m, 1),
      }),
  ],
  [
    /^Sign in in provider settings using "(.+)"\. The login terminal runs on this environment\.$/,
    (gt, m) =>
      gt(
        'Sign in in provider settings using "{method}". The login terminal runs on this environment.',
        { method: at(m, 1) },
      ),
  ],
  [
    /^Sign in in provider settings using "(.+)"\.$/,
    (gt, m) => gt('Sign in in provider settings using "{method}".', { method: at(m, 1) }),
  ],
  [
    /^Could not inspect ACP Registry agent: (.+)$/,
    (gt, m) =>
      gt("Could not inspect ACP Registry agent: {detail}", {
        detail: localizeExternalMessage(at(m, 1), gt),
      }),
  ],
  [
    /^Could not fetch ACP Registry index from (.+)\.$/,
    (gt, m) => gt("Could not fetch ACP Registry index from {url}.", { url: at(m, 1) }),
  ],
  [
    /^The ACP agent did not resolve and create a test session within (\d+(?:\.\d+)?) seconds\. Package installation or agent startup may be slow; this check retries on the next provider refresh\.$/,
    (gt, m) =>
      gt(
        "The ACP agent did not resolve and create a test session within {seconds} seconds. Package installation or agent startup may be slow; this check retries on the next provider refresh.",
        { seconds: at(m, 1) },
      ),
  ],

  // Provider update progress (providerMaintenanceRunner.ts); last, it matches any "Running …".
  [/^Running (.+)$/, (gt, m) => gt("Running {command}", { command: at(m, 1) })],
];

function localizeWhole(message: string, gt: Translate): string | null {
  const index = exactIndex.get(message);
  if (index !== undefined) return exactMessages(gt)[index]?.() ?? null;
  for (const [pattern, render] of TEMPLATES) {
    const match = pattern.exec(message);
    if (match) return render(gt, match);
  }
  return DURATION.test(message) ? localizeDuration(message, gt) : null;
}

const SENTENCE_BREAK = /(?<=[.!?])\s+(?=[A-Z`"(])/;

// Servers join optional sentences ("… on the server." + " Installing …"); match the longest
// known run of sentences at each position so multi-sentence templates still apply.
function localizeSentences(message: string, gt: Translate): string | null {
  const sentences = message.split(SENTENCE_BREAK);
  if (sentences.length < 2) return null;
  const parts: Array<{ readonly text: string; readonly localized: boolean }> = [];
  for (let start = 0; start < sentences.length;) {
    let end = sentences.length;
    let localized: string | null = null;
    for (; end > start; end -= 1) {
      localized = localizeWhole(sentences.slice(start, end).join(" "), gt);
      if (localized !== null) break;
    }
    if (localized === null) {
      parts.push({ text: sentences[start] ?? "", localized: false });
      start += 1;
    } else {
      parts.push({ text: localized, localized: true });
      start = end;
    }
  }
  if (!parts.some((part) => part.localized)) return null;
  return parts
    .map((part, index) => {
      const previous = parts[index - 1];
      if (previous === undefined) return part.text;
      return previous.localized && part.localized ? part.text : ` ${part.text}`;
    })
    .join("");
}

function localizeSegments(message: string, gt: Translate): string | null {
  const segments = message.split(" · ");
  if (segments.length < 2) return null;
  let changed = false;
  const localized = segments.map((segment) => {
    const result = localizeWhole(segment, gt);
    if (result === null) return segment;
    changed = true;
    return result;
  });
  return changed ? localized.join(" · ") : null;
}

/**
 * Translates English produced outside apps/web: shared package presentation, server provider
 * status, and relay errors. Unknown text comes back unchanged.
 */
export function localizeExternalMessage(message: string, gt: Translate): string;
export function localizeExternalMessage(
  message: string | null | undefined,
  gt: Translate,
): string | null;
export function localizeExternalMessage(
  message: string | null | undefined,
  gt: Translate,
): string | null {
  if (message === null || message === undefined) return null;
  return (
    localizeWhole(message, gt) ??
    localizeSentences(message, gt) ??
    localizeSegments(message, gt) ??
    message
  );
}
