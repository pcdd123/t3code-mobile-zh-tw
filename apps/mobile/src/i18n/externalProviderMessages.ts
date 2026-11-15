import type { useGT } from "gt-react-native";

type Translate = ReturnType<typeof useGT>;

/** Status, setup and sign-in text from the less common provider drivers. */
export function localizeProviderMessage(
  message: string,
  gt: Translate,
  localizeNested: (message: string) => string,
): string | undefined {
  const exact = exactProviderMessage(message, gt);
  if (exact !== undefined) return exact;
  for (const [pattern, render] of PROVIDER_TEMPLATES) {
    const match = pattern.exec(message);
    if (match) return render(match, gt, localizeNested);
  }
  return undefined;
}

type Render = (
  match: RegExpExecArray,
  gt: Translate,
  localizeNested: (message: string) => string,
) => string;

const pattern = (source: string) => new RegExp(`^${source}$`);

const PROVIDER_TEMPLATES: ReadonlyArray<readonly [RegExp, Render]> = [
  [
    pattern("Pi (\\S+) is unsupported\\. Update to Pi (\\S+) or newer\\."),
    (m, gt) =>
      gt("Pi {version} is unsupported. Update to Pi {minVersion} or newer.", {
        version: m[1]!,
        minVersion: m[2]!,
      }),
  ],
  [
    pattern("T3 Code could not determine the Pi version\\. Pi (\\S+) or newer is required\\."),
    (m, gt) =>
      gt("T3 Code could not determine the Pi version. Pi {minVersion} or newer is required.", {
        minVersion: m[1]!,
      }),
  ],
  [
    pattern(
      "(.+) uses (.+), which has no available models in Pi\\. Choose another model, or check that provider's setup and the Pi launch arguments\\.",
    ),
    (m, gt) =>
      gt(
        "{model} uses {provider}, which has no available models in Pi. Choose another model, or check that provider's setup and the Pi launch arguments.",
        { model: m[1]!, provider: m[2]! },
      ),
  ],
  [
    pattern(
      "(.+) has no credentials configured for (.+)\\. Choose another model, or run `pi` in a terminal and use /login or configure its API key\\.",
    ),
    (m, gt) =>
      gt(
        "{model} has no credentials configured for {provider}. Choose another model, or run `pi` in a terminal and use /login or configure its API key.",
        { model: m[1]!, provider: m[2]! },
      ),
  ],
  [
    pattern("ACP Registry does not contain agent '(.+)'\\."),
    (m, gt) => gt("ACP Registry does not contain agent ''{agentId}''.", { agentId: m[1]! }),
  ],
  [
    pattern("ACP Registry agent '(.+)' has no compatible distribution for this environment\\."),
    (m, gt) =>
      gt("ACP Registry agent ''{agentId}'' has no compatible distribution for this environment.", {
        agentId: m[1]!,
      }),
  ],
  [
    pattern("ACP executable '(.+)' is not available on this environment's PATH\\."),
    (m, gt) =>
      gt("ACP executable ''{runner}'' is not available on this environment's PATH.", {
        runner: m[1]!,
      }),
  ],
  [
    pattern("ACP Registry agent '(.+)' has not been prepared on this environment\\."),
    (m, gt) =>
      gt("ACP Registry agent ''{agentId}'' has not been prepared on this environment.", {
        agentId: m[1]!,
      }),
  ],
  [
    pattern(
      'Sign in in provider settings using "(.+)"\\. The login terminal runs on this environment\\.',
    ),
    (m, gt) =>
      gt(
        'Sign in in provider settings using "{method}". The login terminal runs on this environment.',
        { method: m[1]! },
      ),
  ],
  [
    pattern('Sign in in provider settings using "(.+)"\\.'),
    (m, gt) => gt('Sign in in provider settings using "{method}".', { method: m[1]! }),
  ],
  [
    pattern(
      "Set (.+) under this instance's environment variables in provider settings\\. T3 Code will detect it on the next provider refresh\\.",
    ),
    (m, gt) =>
      gt(
        "Set {variables} under this instance's environment variables in provider settings. T3 Code will detect it on the next provider refresh.",
        { variables: m[1]! },
      ),
  ],
  [
    pattern("Could not inspect ACP Registry agent: (.+)"),
    (m, gt, localizeNested) =>
      gt("Could not inspect ACP Registry agent: {reason}", { reason: localizeNested(m[1]!) }),
  ],
  [
    pattern(
      "The ACP agent did not resolve and create a test session within (\\d+(?:\\.\\d+)?) seconds\\. Package installation or agent startup may be slow; this check retries on the next provider refresh\\.",
    ),
    (m, gt) =>
      gt(
        "The ACP agent did not resolve and create a test session within {seconds} seconds. Package installation or agent startup may be slow; this check retries on the next provider refresh.",
        { seconds: m[1]! },
      ),
  ],
  [
    pattern(
      "ACP Registry agent (\\S+) requires '(.+)', but it is not available on this environment's PATH\\.",
    ),
    (m, gt) =>
      gt(
        "ACP Registry agent {agentId} requires ''{command}'', but it is not available on this environment's PATH.",
        { agentId: m[1]!, command: m[2]! },
      ),
  ],
  [
    pattern(
      "ACP Registry agent (\\S+) requires '(.+)', but it is not available on this provider instance's PATH\\.",
    ),
    (m, gt) =>
      gt(
        "ACP Registry agent {agentId} requires ''{command}'', but it is not available on this provider instance's PATH.",
        { agentId: m[1]!, command: m[2]! },
      ),
  ],
  [
    pattern("Could not fetch ACP Registry index from (.+)\\."),
    (m, gt) => gt("Could not fetch ACP Registry index from {url}.", { url: m[1]! }),
  ],
  [
    pattern("Could not download ACP Registry agent (\\S+) (\\S+)\\."),
    (m, gt) =>
      gt("Could not download ACP Registry agent {agentId} {version}.", {
        agentId: m[1]!,
        version: m[2]!,
      }),
  ],
  [
    pattern("Timed out downloading ACP Registry agent (\\S+) (\\S+)\\."),
    (m, gt) =>
      gt("Timed out downloading ACP Registry agent {agentId} {version}.", {
        agentId: m[1]!,
        version: m[2]!,
      }),
  ],
  [
    pattern("Could not install ACP Registry agent (\\S+)\\."),
    (m, gt) => gt("Could not install ACP Registry agent {agentId}.", { agentId: m[1]! }),
  ],
  [
    pattern("ACP Registry does not support platform (\\S+)\\."),
    (m, gt) => gt("ACP Registry does not support platform {platform}.", { platform: m[1]! }),
  ],
  [
    pattern(
      "ACP Registry agent (\\S+) has no (compatible|binary|npx|uvx) distribution for (\\S+)\\.",
    ),
    (m, gt) =>
      gt("ACP Registry agent {agentId} has no {distribution} distribution for {platform}.", {
        agentId: m[1]!,
        distribution: m[2]!,
        platform: m[3]!,
      }),
  ],
  [
    pattern(
      "Antigravity (\\S+) no longer works with this T3 Code release\\. Update it in Antigravity setup\\.",
    ),
    (m, gt) =>
      gt(
        "Antigravity {version} no longer works with this T3 Code release. Update it in Antigravity setup.",
        { version: m[1]! },
      ),
  ],
  [
    pattern(
      "Google does not publish an Antigravity runtime for (\\S+)\\. Use a supported environment or a custom executable\\.",
    ),
    (m, gt) =>
      gt(
        "Google does not publish an Antigravity runtime for {platform}. Use a supported environment or a custom executable.",
        { platform: m[1]! },
      ),
  ],
  [
    pattern(
      "Google does not publish an Antigravity runtime for (\\S+)\\. Use a supported remote environment or a custom executable\\.",
    ),
    (m, gt) =>
      gt(
        "Google does not publish an Antigravity runtime for {platform}. Use a supported remote environment or a custom executable.",
        { platform: m[1]! },
      ),
  ],
  [
    pattern("Antigravity needs at least (\\d+) MiB of free space to install\\."),
    (m, gt) =>
      gt("Antigravity needs at least {size} MiB of free space to install.", { size: m[1]! }),
  ],
  [
    pattern("Could not link Antigravity user skills at (.+)\\."),
    (m, gt) => gt("Could not link Antigravity user skills at {path}.", { path: m[1]! }),
  ],
  [pattern("Reconnect (\\S+@\\S+)\\."), (m, gt) => gt("Reconnect {email}.", { email: m[1]! })],
  [pattern("Connection (\\d+)"), (m, gt) => gt("Connection {number}", { number: m[1]! })],
];

function exactProviderMessage(message: string, gt: Translate): string | undefined {
  switch (message) {
    // Kiro.
    case "Checking Kiro CLI availability...":
      return gt("Checking Kiro CLI availability...");
    case "Kiro is disabled in T3 Code settings.":
      return gt("Kiro is disabled in T3 Code settings.");
    case "Kiro CLI (`kiro-cli`) is not installed or not on PATH.":
      return gt("Kiro CLI (`kiro-cli`) is not installed or not on PATH.");
    case "Failed to run `kiro-cli --version`.":
      return gt("Failed to run `kiro-cli --version`.");
    case "Kiro CLI is installed but failed to run.":
      return gt("Kiro CLI is installed but failed to run.");
    case "Kiro CLI is installed but not signed in. Run `kiro-cli login`.":
      return gt("Kiro CLI is installed but not signed in. Run `kiro-cli login`.");
    case "Could not confirm the Kiro sign-in. Run `kiro-cli whoami` to check.":
      return gt("Could not confirm the Kiro sign-in. Run `kiro-cli whoami` to check.");
    case "Kiro API key":
      return gt("Kiro API key");
    case "Kiro account":
      return gt("Kiro account");
    case "Kiro could not compact the conversation.":
      return gt("Kiro could not compact the conversation.");
    case "Kiro did not queue the steering message.":
      return gt("Kiro did not queue the steering message.");
    // Muse Code.
    case "Checking Muse Code CLI availability...":
      return gt("Checking Muse Code CLI availability...");
    case "Muse Code is disabled in T3 Code settings.":
      return gt("Muse Code is disabled in T3 Code settings.");
    case "Muse Code CLI (`muse`) was not found. Install Muse Code and run `muse login` on this T3 server host.":
      return gt(
        "Muse Code CLI (`muse`) was not found. Install Muse Code and run `muse login` on this T3 server host.",
      );
    case "Failed to execute Muse Code CLI. Check its binary path on this T3 server host.":
      return gt("Failed to execute Muse Code CLI. Check its binary path on this T3 server host.");
    case "Muse Code CLI version check timed out.":
      return gt("Muse Code CLI version check timed out.");
    case "Muse Code has not finished installing. Run `muse --version` on this T3 server host, then refresh its status.":
      return gt(
        "Muse Code has not finished installing. Run `muse --version` on this T3 server host, then refresh its status.",
      );
    case "Muse Code CLI is installed but failed to run.":
      return gt("Muse Code CLI is installed but failed to run.");
    case "Muse Code SDK could not read the model catalog. Check your Muse installation and run `muse login` on this T3 server host.":
      return gt(
        "Muse Code SDK could not read the model catalog. Check your Muse installation and run `muse login` on this T3 server host.",
      );
    case "Muse Code returned no models. Run `muse login` on this T3 server host and refresh its status.":
      return gt(
        "Muse Code returned no models. Run `muse login` on this T3 server host and refresh its status.",
      );
    // fx.
    case "Checking fx CLI availability...":
      return gt("Checking fx CLI availability...");
    case "fx is disabled in T3 Code settings.":
      return gt("fx is disabled in T3 Code settings.");
    case "fx is not installed or not on PATH.":
      return gt("fx is not installed or not on PATH.");
    case "Failed to run `fx --version`.":
      return gt("Failed to run `fx --version`.");
    case "fx is installed but failed to run.":
      return gt("fx is installed but failed to run.");
    case "Run `fx login` to sign in.":
      return gt("Run `fx login` to sign in.");
    case "fx is installed but login state could not be determined.":
      return gt("fx is installed but login state could not be determined.");
    case "fx is installed but model listing failed. Model options may be incomplete.":
      return gt("fx is installed but model listing failed. Model options may be incomplete.");
    // Pi.
    case "Pi is disabled in T3 Code settings.":
      return gt("Pi is disabled in T3 Code settings.");
    case "Checking Pi CLI availability...":
      return gt("Checking Pi CLI availability...");
    case "Pi CLI health check failed.":
      return gt("Pi CLI health check failed.");
    case "Pi CLI (`pi`) is not installed or not on PATH. Install with `npm install -g --ignore-scripts @earendil-works/pi-coding-agent`.":
      return gt(
        "Pi CLI (`pi`) is not installed or not on PATH. Install with `npm install -g --ignore-scripts @earendil-works/pi-coding-agent`.",
      );
    case "Failed to execute Pi CLI health check.":
      return gt("Failed to execute Pi CLI health check.");
    case "Pi CLI is installed but timed out while running `pi --version`.":
      return gt("Pi CLI is installed but timed out while running `pi --version`.");
    case "Pi CLI is installed but failed to run.":
      return gt("Pi CLI is installed but failed to run.");
    case "Pi RPC discovery failed.":
      return gt("Pi RPC discovery failed.");
    case "Pi is available, but T3 Code could not refresh its models and commands. The live session will retry startup.":
      return gt(
        "Pi is available, but T3 Code could not refresh its models and commands. The live session will retry startup.",
      );
    case "Pi is available, but model and command discovery needs interactive input. The live session will handle it.":
      return gt(
        "Pi is available, but model and command discovery needs interactive input. The live session will handle it.",
      );
    case "Pi has no usable models. Run `pi` in a terminal and use /login, or configure an API key in ~/.pi/agent.":
      return gt(
        "Pi has no usable models. Run `pi` in a terminal and use /login, or configure an API key in ~/.pi/agent.",
      );
    // ACP Registry.
    case "Checking ACP Registry agent readiness...":
      return gt("Checking ACP Registry agent readiness...");
    case "ACP Registry is disabled in T3 Code settings.":
      return gt("ACP Registry is disabled in T3 Code settings.");
    case "Select an ACP Registry agent or configure a local ACP executable before starting a thread.":
      return gt(
        "Select an ACP Registry agent or configure a local ACP executable before starting a thread.",
      );
    case "Local ACP executable is not available on this environment's PATH.":
      return gt("Local ACP executable is not available on this environment's PATH.");
    case "Checking ACP authentication, models, and commands in the background...":
      return gt("Checking ACP authentication, models, and commands in the background...");
    case "Could not prepare the selected ACP agent.":
      return gt("Could not prepare the selected ACP agent.");
    case "Could not start the selected ACP agent.":
      return gt("Could not start the selected ACP agent.");
    case "Could not inspect the selected ACP agent.":
      return gt("Could not inspect the selected ACP agent.");
    case "Prepare this ACP agent before signing in.":
      return gt("Prepare this ACP agent before signing in.");
    case "Could not discover this agent's sign-in methods.":
      return gt("Could not discover this agent's sign-in methods.");
    case "The ACP agent did not advertise sign-in methods in time.":
      return gt("The ACP agent did not advertise sign-in methods in time.");
    case "Sign-in discovery was interrupted by an active provider session. Try again.":
      return gt("Sign-in discovery was interrupted by an active provider session. Try again.");
    case "Interactive provider login is unavailable on this environment.":
      return gt("Interactive provider login is unavailable on this environment.");
    case "Could not open the provider sign-in terminal.":
      return gt("Could not open the provider sign-in terminal.");
    case "The provider sign-in terminal is no longer available.":
      return gt("The provider sign-in terminal is no longer available.");
    case "The provider login command did not finish successfully.":
      return gt("The provider login command did not finish successfully.");
    case "Enable this provider before signing in.":
      return gt("Enable this provider before signing in.");
    case "Could not initialize the selected ACP agent.":
      return gt("Could not initialize the selected ACP agent.");
    case "The agent no longer advertises this sign-in method.":
      return gt("The agent no longer advertises this sign-in method.");
    case "The provider could not create a session after terminal sign-in.":
      return gt("The provider could not create a session after terminal sign-in.");
    case "This runtime does not support explicit ACP sign-in.":
      return gt("This runtime does not support explicit ACP sign-in.");
    case "The ACP agent could not complete sign-in.":
      return gt("The ACP agent could not complete sign-in.");
    case "The provider could not create a session after sign-in.":
      return gt("The provider could not create a session after sign-in.");
    case "This ACP agent could not sign out. It may not advertise logout support.":
      return gt("This ACP agent could not sign out. It may not advertise logout support.");
    case "The ACP agent did not finish signing out in time.":
      return gt("The ACP agent did not finish signing out in time.");
    case "Could not save ACP sign-in confirmation.":
      return gt("Could not save ACP sign-in confirmation.");
    case "The ACP agent could not complete authentication.":
      return gt("The ACP agent could not complete authentication.");
    case "The ACP agent could not create a test session.":
      return gt("The ACP agent could not create a test session.");
    case "ACP Registry returned invalid JSON.":
      return gt("ACP Registry returned invalid JSON.");
    case "ACP Registry returned an invalid index.":
      return gt("ACP Registry returned an invalid index.");
    case "Timed out fetching ACP Registry index.":
      return gt("Timed out fetching ACP Registry index.");
    case "No valid cached ACP Registry index is available.":
      return gt("No valid cached ACP Registry index is available.");
    case "Local ACP provider requires an executable.":
      return gt("Local ACP provider requires an executable.");
    case "ACP Registry provider requires a registry agent ID.":
      return gt("ACP Registry provider requires a registry agent ID.");
    case "Local ACP commands launch without a shell. For a Windows batch wrapper, configure the underlying executable (for example node.exe) and pass the script path as an argument.":
      return gt(
        "Local ACP commands launch without a shell. For a Windows batch wrapper, configure the underlying executable (for example node.exe) and pass the script path as an argument.",
      );
    // Antigravity installation.
    case "Google's linux-arm64 Antigravity runtime needs a kernel with 4 KiB memory pages, and this kernel uses larger pages (as on Asahi Linux or Raspberry Pi 5). Use a remote environment or a custom Antigravity executable.":
      return gt(
        "Google's linux-arm64 Antigravity runtime needs a kernel with 4 KiB memory pages, and this kernel uses larger pages (as on Asahi Linux or Raspberry Pi 5). Use a remote environment or a custom Antigravity executable.",
      );
    case "This Antigravity release was withdrawn. Check for updates and try again.":
      return gt("This Antigravity release was withdrawn. Check for updates and try again.");
    case "The managed runtime record is invalid. Reinstall Antigravity.":
      return gt("The managed runtime record is invalid. Reinstall Antigravity.");
    case "The managed Antigravity runtime is incomplete. Reinstall it.":
      return gt("The managed Antigravity runtime is incomplete. Reinstall it.");
    case "The custom Antigravity executable is missing or not executable, or it needs a localharness_external sibling. The agy CLI does not.":
      return gt(
        "The custom Antigravity executable is missing or not executable, or it needs a localharness_external sibling. The agy CLI does not.",
      );
    case "Antigravity ACP runtime is not installed. Install it in this environment's provider settings or set a custom ACP executable path. The Antigravity app, IDE, and CLI are separate installations.":
      return gt(
        "Antigravity ACP runtime is not installed. Install it in this environment's provider settings or set a custom ACP executable path. The Antigravity app, IDE, and CLI are separate installations.",
      );
    case "Could not read the Antigravity installation. Reinstall it or set a custom executable path.":
      return gt(
        "Could not read the Antigravity installation. Reinstall it or set a custom executable path.",
      );
    case "The downloaded runtime did not identify as the expected Google Antigravity release.":
      return gt(
        "The downloaded runtime did not identify as the expected Google Antigravity release.",
      );
    case "Antigravity requires IPv6 socket support. Enable IPv6 in this environment. On WSL, remove ipv6.disable=1 from .wslconfig and run wsl --shutdown.":
      return gt(
        "Antigravity requires IPv6 socket support. Enable IPv6 in this environment. On WSL, remove ipv6.disable=1 from .wslconfig and run wsl --shutdown.",
      );
    case "The downloaded Antigravity runtime could not start in this environment.":
      return gt("The downloaded Antigravity runtime could not start in this environment.");
    case "Could not activate Antigravity. The previous runtime is unchanged. Check for locked files and try again.":
      return gt(
        "Could not activate Antigravity. The previous runtime is unchanged. Check for locked files and try again.",
      );
    case "The existing managed release has the wrong version. Remove it before reinstalling.":
      return gt(
        "The existing managed release has the wrong version. Remove it before reinstalling.",
      );
    case "Checking the installed runtime.":
      return gt("Checking the installed runtime.");
    case "Could not check free disk space.":
      return gt("Could not check free disk space.");
    case "The Antigravity download size did not match the pinned release.":
      return gt("The Antigravity download size did not match the pinned release.");
    case "The Antigravity download exceeded its allowed size.":
      return gt("The Antigravity download exceeded its allowed size.");
    case "Could not download Antigravity from Google. Check the network connection and any proxy settings, then try again.":
      return gt(
        "Could not download Antigravity from Google. Check the network connection and any proxy settings, then try again.",
      );
    case "The Antigravity download failed its size or checksum check. Nothing was installed.":
      return gt(
        "The Antigravity download failed its size or checksum check. Nothing was installed.",
      );
    case "Extracting the verified runtime.":
      return gt("Extracting the verified runtime.");
    case "Could not extract the Antigravity executable.":
      return gt("Could not extract the Antigravity executable.");
    case "Could not extract the Antigravity runtime.":
      return gt("Could not extract the Antigravity runtime.");
    case "Could not prepare the Antigravity runtime for this Mac. Check that codesign is available.":
      return gt(
        "Could not prepare the Antigravity runtime for this Mac. Check that codesign is available.",
      );
    case "Checking the downloaded runtime.":
      return gt("Checking the downloaded runtime.");
    case "Another installation published a different Antigravity release.":
      return gt("Another installation published a different Antigravity release.");
    case "Could not publish the Antigravity runtime. The previous release is unchanged. Try again.":
      return gt(
        "Could not publish the Antigravity runtime. The previous release is unchanged. Try again.",
      );
    case "Could not install Antigravity. Check free disk space and directory access, then try again.":
      return gt(
        "Could not install Antigravity. Check free disk space and directory access, then try again.",
      );
    case "Could not find a native Antigravity CLI release. Check the network connection and try again.":
      return gt(
        "Could not find a native Antigravity CLI release. Check the network connection and try again.",
      );
    case "Downloading Google's official Antigravity runtime.":
      return gt("Downloading Google's official Antigravity runtime.");
    case "Could not verify the installed Antigravity runtime.":
      return gt("Could not verify the installed Antigravity runtime.");
    case "Installation cancelled. The previous runtime is unchanged.":
      return gt("Installation cancelled. The previous runtime is unchanged.");
    case "Could not finish the Antigravity installation. Check disk space and directory access.":
      return gt(
        "Could not finish the Antigravity installation. Check disk space and directory access.",
      );
    case "Could not start the Antigravity installation.":
      return gt("Could not start the Antigravity installation.");
    case "This installation is no longer current. Refresh its status before cancelling.":
      return gt("This installation is no longer current. Refresh its status before cancelling.");
    case "Stop Antigravity sessions and sign-in flows before removing its managed runtime.":
      return gt("Stop Antigravity sessions and sign-in flows before removing its managed runtime.");
    case "A provider instance has a custom path inside this managed runtime. Clear that path before removing it.":
      return gt(
        "A provider instance has a custom path inside this managed runtime. Clear that path before removing it.",
      );
    case "Could not remove the managed Antigravity runtime. Check for open processes and try again.":
      return gt(
        "Could not remove the managed Antigravity runtime. Check for open processes and try again.",
      );
    case "The managed Antigravity runtime is incomplete. Remove it and reinstall.":
      return gt("The managed Antigravity runtime is incomplete. Remove it and reinstall.");
    // Antigravity sign-in.
    case "Antigravity has not started after 90 seconds. Its runtime may be stuck starting on this machine.":
      return gt(
        "Antigravity has not started after 90 seconds. Its runtime may be stuck starting on this machine.",
      );
    case "Antigravity did not respond. Its runtime may not run on this machine.":
      return gt("Antigravity did not respond. Its runtime may not run on this machine.");
    case "Antigravity has not reached Google after 30 seconds. Check this machine's network connection. Broken IPv6 is a common cause.":
      return gt(
        "Antigravity has not reached Google after 30 seconds. Check this machine's network connection. Broken IPv6 is a common cause.",
      );
    case "Antigravity could not reach Google. Check this machine's network connection, then start sign-in again.":
      return gt(
        "Antigravity could not reach Google. Check this machine's network connection, then start sign-in again.",
      );
    case "Could not deliver the sign-in response. Start sign-in again.":
      return gt("Could not deliver the sign-in response. Start sign-in again.");
    case "Google requires an eligible Antigravity subscription for this account.":
      return gt("Google requires an eligible Antigravity subscription for this account.");
    case "Google sign-in was not approved. Start sign-in again.":
      return gt("Google sign-in was not approved. Start sign-in again.");
    case "Antigravity authenticated, but could not initialize a session or load models.":
      return gt("Antigravity authenticated, but could not initialize a session or load models.");
    case "Antigravity rejected the configured credentials. Check the provider settings.":
      return gt("Antigravity rejected the configured credentials. Check the provider settings.");
    case "Antigravity could not authenticate with the configured credentials.":
      return gt("Antigravity could not authenticate with the configured credentials.");
    case "Antigravity sign-in or sign-out is in progress. Try again after it finishes.":
      return gt("Antigravity sign-in or sign-out is in progress. Try again after it finishes.");
    case "Signed in with Google.":
      return gt("Signed in with Google.");
    case "Connected to Antigravity.":
      return gt("Connected to Antigravity.");
    case "Antigravity started more than one Google sign-in request.":
      return gt("Antigravity started more than one Google sign-in request.");
    case "This sign-in is no longer active in this client.":
      return gt("This sign-in is no longer active in this client.");
    case "Antigravity setup is already in progress.":
      return gt("Antigravity setup is already in progress.");
    case "Could not start Google sign-in. Try again.":
      return gt("Could not start Google sign-in. Try again.");
    case "The sign-in response was already sent. Wait for Google to finish.":
      return gt("The sign-in response was already sent. Wait for Google to finish.");
    case "Wait for the Google sign-in link before you send a redirect URL.":
      return gt("Wait for the Google sign-in link before you send a redirect URL.");
    case "Antigravity setup is already stopping.":
      return gt("Antigravity setup is already stopping.");
    case "Google sign-in was cancelled by sign-out.":
      return gt("Google sign-in was cancelled by sign-out.");
    case "This Antigravity version does not support sign-out. Update the provider.":
      return gt("This Antigravity version does not support sign-out. Update the provider.");
    case "Antigravity sign-out timed out.":
      return gt("Antigravity sign-out timed out.");
    case "Signed out of Google.":
      return gt("Signed out of Google.");
    case "Antigravity sign-out failed. Try again.":
      return gt("Antigravity sign-out failed. Try again.");
    case "Sign in to Antigravity in Settings before you continue.":
      return gt("Sign in to Antigravity in Settings before you continue.");
    case "Gemini Enterprise":
      return gt("Gemini Enterprise");
    case "Agent Platform":
      return gt("Agent Platform");
    case "Gemini Enterprise needs a GCP project and location in the Antigravity provider settings.":
      return gt(
        "Gemini Enterprise needs a GCP project and location in the Antigravity provider settings.",
      );
    case "Enter a Gemini API key in the Antigravity provider settings.":
      return gt("Enter a Gemini API key in the Antigravity provider settings.");
    case "Agent Platform needs an API key, or a GCP project and location, in the Antigravity provider settings.":
      return gt(
        "Agent Platform needs an API key, or a GCP project and location, in the Antigravity provider settings.",
      );
    case "Antigravity user skills are not linked into the profile.":
      return gt("Antigravity user skills are not linked into the profile.");
    case "Antigravity sign-in":
      return gt("Antigravity sign-in");
    case "Antigravity browser suppression could not be verified.":
      return gt("Antigravity browser suppression could not be verified.");
    case "Antigravity browser suppression verification timed out.":
      return gt("Antigravity browser suppression verification timed out.");
    case "The Antigravity profile directory could not be created.":
      return gt("The Antigravity profile directory could not be created.");
    case "The Antigravity profile directory permissions could not be set.":
      return gt("The Antigravity profile directory permissions could not be set.");
    case "The Antigravity profile settings could not be written.":
      return gt("The Antigravity profile settings could not be written.");
    case "Antigravity returned an invalid Google sign-in URL.":
      return gt("Antigravity returned an invalid Google sign-in URL.");
    case "The sign-in response URL is too long.":
      return gt("The sign-in response URL is too long.");
    case "Paste the complete redirect URL from the Google sign-in page.":
      return gt("Paste the complete redirect URL from the Google sign-in page.");
    case "This redirect URL does not belong to the current sign-in.":
      return gt("This redirect URL does not belong to the current sign-in.");
    case "The redirect URL must contain one Google sign-in response.":
      return gt("The redirect URL must contain one Google sign-in response.");
    case "The redirect URL is not a Google sign-in response.":
      return gt("The redirect URL is not a Google sign-in response.");
    case "The sign-in response timed out. Start sign-in again.":
      return gt("The sign-in response timed out. Start sign-in again.");
    // ChatGPT sign-in.
    case "ChatGPT sign-in configuration could not be verified.":
      return gt("ChatGPT sign-in configuration could not be verified.");
    case "Could not read the saved ChatGPT connection.":
      return gt("Could not read the saved ChatGPT connection.");
    case "The saved ChatGPT connection is invalid. Sign in again.":
      return gt("The saved ChatGPT connection is invalid. Sign in again.");
    case "Could not save the ChatGPT connection.":
      return gt("Could not save the ChatGPT connection.");
    case "Could not read the ChatGPT sign-in registration. Try again.":
      return gt("Could not read the ChatGPT sign-in registration. Try again.");
    case "The saved ChatGPT sign-in registration is invalid.":
      return gt("The saved ChatGPT sign-in registration is invalid.");
    case "Could not save the ChatGPT sign-in registration. Try again.":
      return gt("Could not save the ChatGPT sign-in registration. Try again.");
    case "Could not clear the ChatGPT connection. Try again.":
      return gt("Could not clear the ChatGPT connection. Try again.");
    case "OpenAI rejected this app's client registration. Check the ChatGPT connection configuration.":
      return gt(
        "OpenAI rejected this app's client registration. Check the ChatGPT connection configuration.",
      );
    case "ChatGPT returned an invalid token response. Sign in again.":
      return gt("ChatGPT returned an invalid token response. Sign in again.");
    case "Sign-in is no longer active.":
      return gt("Sign-in is no longer active.");
    case "This response does not belong to the active sign-in.":
      return gt("This response does not belong to the active sign-in.");
    case "Could not start the local sign-in callback. Try again.":
      return gt("Could not start the local sign-in callback. Try again.");
    case "Could not start the local sign-in callback.":
      return gt("Could not start the local sign-in callback.");
    case "This redirect URL does not belong to the active ChatGPT sign-in.":
      return gt("This redirect URL does not belong to the active ChatGPT sign-in.");
    case "ChatGPT registration is incomplete. Start sign-in again.":
      return gt("ChatGPT registration is incomplete. Start sign-in again.");
    case "This sign-in code expired. Reconnect the saved ChatGPT profile to start a fresh sign-in.":
      return gt(
        "This sign-in code expired. Reconnect the saved ChatGPT profile to start a fresh sign-in.",
      );
    case "ChatGPT did not return a verified identity. Sign in again.":
      return gt("ChatGPT did not return a verified identity. Sign in again.");
    case "This sign-in returned a different ChatGPT account. Use the different-account sign-in option instead. Your saved connection is unchanged.":
      return gt(
        "This sign-in returned a different ChatGPT account. Use the different-account sign-in option instead. Your saved connection is unchanged.",
      );
    case "ChatGPT returned a conflicting account registration. Start again.":
      return gt("ChatGPT returned a conflicting account registration. Start again.");
    case "ChatGPT returned an unsupported connection. Sign in again.":
      return gt("ChatGPT returned an unsupported connection. Sign in again.");
    case "The ChatGPT connection changed. Start a new session.":
      return gt("The ChatGPT connection changed. Start a new session.");
    case "ChatGPT cannot renew this connection yet. Try again shortly.":
      return gt("ChatGPT cannot renew this connection yet. Try again shortly.");
    case "ChatGPT returned an invalid renewal. Sign in again.":
      return gt("ChatGPT returned an invalid renewal. Sign in again.");
    case "Signed out locally. Remote revocation could not be confirmed. Disconnect the app in ChatGPT Settings.":
      return gt(
        "Signed out locally. Remote revocation could not be confirmed. Disconnect the app in ChatGPT Settings.",
      );
    case "Sign in with ChatGPT":
      return gt("Sign in with ChatGPT");
    case "Use a different ChatGPT account":
      return gt("Use a different ChatGPT account");
    case "Register a connection for another ChatGPT account.":
      return gt("Register a connection for another ChatGPT account.");
    case "ChatGPT account":
      return gt("ChatGPT account");
    case "Reuse this account's original sign-in registration.":
      return gt("Reuse this account's original sign-in registration.");
    case "Only incomplete ChatGPT connections can be removed.":
      return gt("Only incomplete ChatGPT connections can be removed.");
    case "Could not remove the saved ChatGPT connection. Try again.":
      return gt("Could not remove the saved ChatGPT connection. Try again.");
    case "This saved connection is no longer available.":
      return gt("This saved connection is no longer available.");
    case "Complete ChatGPT sign-in before transferring this connection.":
      return gt("Complete ChatGPT sign-in before transferring this connection.");
    case "The transferred ChatGPT connection is invalid or expired.":
      return gt("The transferred ChatGPT connection is invalid or expired.");
    case "The transferred ChatGPT identity could not be verified.":
      return gt("The transferred ChatGPT identity could not be verified.");
    case "The transferred ChatGPT identity does not match its profile.":
      return gt("The transferred ChatGPT identity does not match its profile.");
    case "The transferred identity conflicts with the saved ChatGPT connection.":
      return gt("The transferred identity conflicts with the saved ChatGPT connection.");
    case "ChatGPT sharing is unavailable for this account or workspace. Use another provider or check its sharing policy.":
      return gt(
        "ChatGPT sharing is unavailable for this account or workspace. Use another provider or check its sharing policy.",
      );
    case "Your ChatGPT usage limit was reached. Check ChatGPT Usage settings for your available allowance.":
      return gt(
        "Your ChatGPT usage limit was reached. Check ChatGPT Usage settings for your available allowance.",
      );
    case "You reached your workspace's limit for using ChatGPT in other apps. Ask your workspace admin to increase it.":
      return gt(
        "You reached your workspace's limit for using ChatGPT in other apps. Ask your workspace admin to increase it.",
      );
    case "ChatGPT usage is temporarily unavailable. Try again shortly.":
      return gt("ChatGPT usage is temporarily unavailable. Try again shortly.");
    case "Codex used a feature that ChatGPT sharing does not support. Use another provider for this request.":
      return gt(
        "Codex used a feature that ChatGPT sharing does not support. Use another provider for this request.",
      );
    case "This app is not enabled for this ChatGPT connection. Use your existing CLI or another provider.":
      return gt(
        "This app is not enabled for this ChatGPT connection. Use your existing CLI or another provider.",
      );
    case "ChatGPT does not support this request route.":
      return gt("ChatGPT does not support this request route.");
    case "ChatGPT could not validate this connection. Check the selected account and sharing permissions.":
      return gt(
        "ChatGPT could not validate this connection. Check the selected account and sharing permissions.",
      );
    case "ChatGPT is temporarily unavailable. Try again shortly.":
      return gt("ChatGPT is temporarily unavailable. Try again shortly.");
    case "This ChatGPT grant does not authorize the request. Check the connection's sharing permissions.":
      return gt(
        "This ChatGPT grant does not authorize the request. Check the connection's sharing permissions.",
      );
    case "ChatGPT could not authorize this connection. Check the client and sharing permissions.":
      return gt(
        "ChatGPT could not authorize this connection. Check the client and sharing permissions.",
      );
    case "Codex sent a tool namespace that ChatGPT sharing does not support. Use another provider for this request.":
      return gt(
        "Codex sent a tool namespace that ChatGPT sharing does not support. Use another provider for this request.",
      );
    case "Codex sent an input item that ChatGPT sharing does not support. Use another provider for this request.":
      return gt(
        "Codex sent an input item that ChatGPT sharing does not support. Use another provider for this request.",
      );
    case "Provider sign-in changed.":
      return gt("Provider sign-in changed.");
    case "This provider does not support ChatGPT profile transfer.":
      return gt("This provider does not support ChatGPT profile transfer.");
    case "This provider does not support removing saved sign-in methods.":
      return gt("This provider does not support removing saved sign-in methods.");
    case "Could not prepare the private managed Codex token listener. Restart T3 and retry.":
      return gt(
        "Could not prepare the private managed Codex token listener. Restart T3 and retry.",
      );
    case "Set up managed Codex before starting a session.":
      return gt("Set up managed Codex before starting a session.");
    case "Could not prepare the managed Codex runtime.":
      return gt("Could not prepare the managed Codex runtime.");
    default:
      return undefined;
  }
}
