import type { useGT } from "gt-react-native";

import { localizeProviderMessage } from "./externalProviderMessages";
import { localizeToolActivity } from "./externalToolActivity";

export type Translate = ReturnType<typeof useGT>;

/**
 * Translates English text that shared packages and the server produce. Packages cannot call `gt`
 * and the extractor only scans this app, so their literals are repeated here byte for byte.
 */
export function localizeExternalMessage(message: string, gt: Translate): string {
  return localizeKnown(message, gt) ?? localizeComposite(message, gt) ?? message;
}

function localizeKnown(message: string, gt: Translate): string | undefined {
  const exact =
    exactMessage(message, gt) ??
    localizeToolActivity(message, gt) ??
    localizeProviderMessage(message, gt, (nested) => localizeExternalMessage(nested, gt));
  if (exact !== undefined) return exact;
  for (const [pattern, render] of TEMPLATES) {
    const match = pattern.exec(message);
    if (match) return render(match, gt);
  }
  return undefined;
}

function localizeComposite(message: string, gt: Translate): string | undefined {
  if (message.includes("\n")) {
    return message
      .split("\n")
      .map((line) => localizeExternalMessage(line, gt))
      .join("\n");
  }
  const hint = HINT_SUFFIX.exec(message);
  if (hint) {
    return `${localizeExternalMessage(hint[1]!, gt)} ${localizeExternalMessage(hint[2]!, gt)}`;
  }
  if (message.includes(" · ")) {
    return message
      .split(" · ")
      .map((part) => localizeExternalMessage(part, gt))
      .join(" · ");
  }
  return localizeClauseList(message, gt);
}

const HINT_SUFFIX = /^(.+?) (Hint: .+)$/;

/**
 * Work-log summaries join clauses as "A and b" or "A, b, and c"; every clause must be known.
 * A clause can itself contain a separator ("Started 2 review guides, 1 failed"), so try each split.
 */
function localizeClauseList(message: string, gt: Translate): string | undefined {
  const parts = message.split(CLAUSE_SEPARATOR);
  // Summaries hold a few clauses; long prose with many commas is not one.
  if (parts.length < 3 || parts.length > 13) return undefined;
  const localized = partitionClauses(parts, 0, gt);
  if (localized === undefined || localized.length < 2) return undefined;
  if (localized.length === 2) {
    return gt("{first} and {second}", { first: localized[0]!, second: localized[1]! });
  }
  const last = localized.pop()!;
  const list = localized.reduce((joined, item) => gt("{list}, {item}", { list: joined, item }));
  return gt("{list}, and {last}", { list, last });
}

const CLAUSE_SEPARATOR = /(, and |, | and )/;

/** `parts` alternates clause text and separators; returns the first split whose clauses are all known. */
function partitionClauses(
  parts: ReadonlyArray<string>,
  start: number,
  gt: Translate,
): string[] | undefined {
  for (let end = start; end < parts.length; end += 2) {
    const clause = parts.slice(start, end + 1).join("");
    const known = localizeKnown(clause.charAt(0).toUpperCase() + clause.slice(1), gt);
    if (known === undefined) continue;
    if (end === parts.length - 1) return [known];
    const rest = partitionClauses(parts, end + 2, gt);
    if (rest !== undefined) return [known, ...rest];
  }
  return undefined;
}

type Render = (match: RegExpExecArray, gt: Translate) => string;

const CHANGE_REQUEST = "(PR|MR|change request)";
const CHANGE_REQUEST_WITH_ARTICLE = "(a PR|an MR|a change request)";
const DEFAULT_BRANCH_SUFFIX =
  ' on "(.+)"\\. You can continue on this branch or create a feature branch and run the same action there\\.';

const DURATION = "(\\d+(?:\\.\\d+)?(?:ms|[dhms])(?: \\d+[dhms])*)";

const pattern = (source: string) => new RegExp(`^${source}$`);

const FULL_DURATION = pattern(DURATION);
const DURATION_PART = /^(\d+(?:\.\d+)?)(ms|[dhms])$/;

/** Translates the units of a formatDuration-style "1h 5m" and keeps its compact shape. */
export function localizeDuration(duration: string, gt: Translate): string {
  if (!FULL_DURATION.test(duration)) return duration;
  return duration
    .split(" ")
    .map((part) => {
      const [, count = part, unit] = DURATION_PART.exec(part) ?? [];
      switch (unit) {
        case "ms":
          return gt("{count}ms", { count });
        case "d":
          return gt("{count}d", { count });
        case "h":
          return gt("{count}h", { count });
        case "m":
          return gt("{count}m", { count });
        case "s":
          return gt("{count}s", { count });
        default:
          return part;
      }
    })
    .join(" ");
}

const TEMPLATES: ReadonlyArray<readonly [RegExp, Render]> = [
  // Git quick actions, disabled reasons, and the default-branch confirmation.
  [
    pattern(`Commit, push & ${CHANGE_REQUEST}`),
    (m, gt) => gt("Commit, push & {changeRequest}", { changeRequest: m[1]! }),
  ],
  [
    pattern(`View ${CHANGE_REQUEST} is currently unavailable\\.`),
    (m, gt) => gt("View {changeRequest} is currently unavailable.", { changeRequest: m[1]! }),
  ],
  [
    pattern(`Create ${CHANGE_REQUEST} is currently unavailable\\.`),
    (m, gt) => gt("Create {changeRequest} is currently unavailable.", { changeRequest: m[1]! }),
  ],
  [
    pattern(`View ${CHANGE_REQUEST}`),
    (m, gt) => gt("View {changeRequest}", { changeRequest: m[1]! }),
  ],
  [
    pattern(`Create ${CHANGE_REQUEST}`),
    (m, gt) => gt("Create {changeRequest}", { changeRequest: m[1]! }),
  ],
  [
    pattern(`Push & create ${CHANGE_REQUEST}`),
    (m, gt) => gt("Push & create {changeRequest}", { changeRequest: m[1]! }),
  ],
  [
    pattern(`Commit, push & create ${CHANGE_REQUEST}`),
    (m, gt) => gt("Commit, push & create {changeRequest}", { changeRequest: m[1]! }),
  ],
  [
    pattern(`Commit, push & create ${CHANGE_REQUEST} from default branch\\?`),
    (m, gt) =>
      gt("Commit, push & create {changeRequest} from default branch?", { changeRequest: m[1]! }),
  ],
  [
    pattern(`Push & create ${CHANGE_REQUEST} from default branch\\?`),
    (m, gt) => gt("Push & create {changeRequest} from default branch?", { changeRequest: m[1]! }),
  ],
  [
    pattern(
      `Create and checkout a branch before pushing or opening ${CHANGE_REQUEST_WITH_ARTICLE}\\.`,
    ),
    (m, gt) =>
      gt("Create and checkout a branch before pushing or opening {changeRequest}.", {
        changeRequest: m[1]!,
      }),
  ],
  [
    pattern(`Add an "origin" remote before pushing or creating ${CHANGE_REQUEST_WITH_ARTICLE}\\.`),
    (m, gt) =>
      gt('Add an "origin" remote before pushing or creating {changeRequest}.', {
        changeRequest: m[1]!,
      }),
  ],
  [
    pattern(`Detached HEAD: checkout a branch before creating ${CHANGE_REQUEST_WITH_ARTICLE}\\.`),
    (m, gt) =>
      gt("Detached HEAD: checkout a branch before creating {changeRequest}.", {
        changeRequest: m[1]!,
      }),
  ],
  [
    pattern(`Add an "origin" remote before creating ${CHANGE_REQUEST_WITH_ARTICLE}\\.`),
    (m, gt) =>
      gt('Add an "origin" remote before creating {changeRequest}.', { changeRequest: m[1]! }),
  ],
  [
    pattern(`No local commits to include in ${CHANGE_REQUEST_WITH_ARTICLE}\\.`),
    (m, gt) => gt("No local commits to include in {changeRequest}.", { changeRequest: m[1]! }),
  ],
  [
    pattern(
      `Branch is behind upstream\\. Pull/rebase before creating ${CHANGE_REQUEST_WITH_ARTICLE}\\.`,
    ),
    (m, gt) =>
      gt("Branch is behind upstream. Pull/rebase before creating {changeRequest}.", {
        changeRequest: m[1]!,
      }),
  ],
  [
    pattern(`This action will commit and push changes${DEFAULT_BRANCH_SUFFIX}`),
    (m, gt) =>
      gt(
        'This action will commit and push changes on "{branch}". You can continue on this branch or create a feature branch and run the same action there.',
        { branch: m[1]! },
      ),
  ],
  [
    pattern(`This action will push local commits${DEFAULT_BRANCH_SUFFIX}`),
    (m, gt) =>
      gt(
        'This action will push local commits on "{branch}". You can continue on this branch or create a feature branch and run the same action there.',
        { branch: m[1]! },
      ),
  ],
  [
    pattern(
      `This action will commit, push, and create ${CHANGE_REQUEST_WITH_ARTICLE}${DEFAULT_BRANCH_SUFFIX}`,
    ),
    (m, gt) =>
      gt(
        'This action will commit, push, and create {changeRequest} on "{branch}". You can continue on this branch or create a feature branch and run the same action there.',
        { changeRequest: m[1]!, branch: m[2]! },
      ),
  ],
  [
    pattern(
      `This action will push local commits and create ${CHANGE_REQUEST_WITH_ARTICLE}${DEFAULT_BRANCH_SUFFIX}`,
    ),
    (m, gt) =>
      gt(
        'This action will push local commits and create {changeRequest} on "{branch}". You can continue on this branch or create a feature branch and run the same action there.',
        { changeRequest: m[1]!, branch: m[2]! },
      ),
  ],
  [pattern("Commit & push to (.+)"), (m, gt) => gt("Commit & push to {branch}", { branch: m[1]! })],
  [pattern("Push to (.+)"), (m, gt) => gt("Push to {branch}", { branch: m[1]! })],

  // Connection diagnosis headlines and steps.
  [
    pattern("(.+) is waiting for someone to approve this device"),
    (m, gt) => gt("{host} is waiting for someone to approve this device", { host: m[1]! }),
  ],
  [
    pattern("(.+) runs an older T3 Code"),
    (m, gt) => gt("{host} runs an older T3 Code", { host: m[1]! }),
  ],
  [
    pattern("(.+) is not linked to your T3 Connect account"),
    (m, gt) => gt("{host} is not linked to your T3 Connect account", { host: m[1]! }),
  ],
  [
    pattern("(.+)'s tunnel is still being set up"),
    (m, gt) => gt("{host}'s tunnel is still being set up", { host: m[1]! }),
  ],
  [
    pattern("T3 Connect is not turned on for (.+)"),
    (m, gt) => gt("T3 Connect is not turned on for {host}", { host: m[1]! }),
  ],
  [
    pattern("(.+)'s tunnel is offline"),
    (m, gt) => gt("{host}'s tunnel is offline", { host: m[1]! }),
  ],
  [
    pattern("Tunnel works, but T3 Code on (.+) did not answer"),
    (m, gt) => gt("Tunnel works, but T3 Code on {host} did not answer", { host: m[1]! }),
  ],
  [
    pattern("T3 Code on (.+) sent an unexpected answer"),
    (m, gt) => gt("T3 Code on {host} sent an unexpected answer", { host: m[1]! }),
  ],
  [
    pattern("(.+)'s tunnel address did not resolve"),
    (m, gt) => gt("{host}'s tunnel address did not resolve", { host: m[1]! }),
  ],
  [
    pattern("Secure connection to (.+)'s tunnel failed"),
    (m, gt) => gt("Secure connection to {host}'s tunnel failed", { host: m[1]! }),
  ],
  [
    pattern("(.+)'s tunnel refused the connection"),
    (m, gt) => gt("{host}'s tunnel refused the connection", { host: m[1]! }),
  ],
  [
    pattern("(.+) did not answer in time"),
    (m, gt) => gt("{host} did not answer in time", { host: m[1]! }),
  ],
  [
    pattern("This device can't reach (.+)'s tunnel"),
    (m, gt) => gt("This device can't reach {host}'s tunnel", { host: m[1]! }),
  ],
  [
    pattern("T3 Connect could not reach (.+)'s tunnel"),
    (m, gt) => gt("T3 Connect could not reach {host}'s tunnel", { host: m[1]! }),
  ],
  [
    pattern("T3 Code on (.+) did not accept this device"),
    (m, gt) => gt("T3 Code on {host} did not accept this device", { host: m[1]! }),
  ],
  [
    pattern("T3 Code on (.+) did not answer"),
    (m, gt) => gt("T3 Code on {host} did not answer", { host: m[1]! }),
  ],
  [
    pattern("On (.+), check Settings > Sharing & access or run `t3 connect status`\\."),
    (m, gt) =>
      gt("On {host}, check Settings > Sharing & access or run `t3 connect status`.", {
        host: m[1]!,
      }),
  ],
  [
    pattern(
      "On a device already connected to (.+), open Settings > Sharing & access and approve the device showing (.+)\\.",
    ),
    (m, gt) =>
      gt(
        "On a device already connected to {host}, open Settings > Sharing & access and approve the device showing {code}.",
        { host: m[1]!, code: m[2]! },
      ),
  ],
  [
    pattern(
      "On a device already connected to (.+), open Settings > Sharing & access and approve this device\\.",
    ),
    (m, gt) =>
      gt(
        "On a device already connected to {host}, open Settings > Sharing & access and approve this device.",
        { host: m[1]! },
      ),
  ],
  [
    pattern("Or run `t3 auth connect-device approve (\\S+)` on (.+)\\."),
    (m, gt) =>
      gt("Or run `t3 auth connect-device approve {code}` on {host}.", { code: m[1]!, host: m[2]! }),
  ],
  [
    pattern("Turn on automatic date and time on this device and on (.+), then retry\\."),
    (m, gt) =>
      gt("Turn on automatic date and time on this device and on {host}, then retry.", {
        host: m[1]!,
      }),
  ],
  [
    pattern("On (.+), open Settings > Sharing & access and turn T3 Connect on\\."),
    (m, gt) =>
      gt("On {host}, open Settings > Sharing & access and turn T3 Connect on.", { host: m[1]! }),
  ],
  [
    pattern("Make sure (.+) is awake and T3 Code is running on it\\."),
    (m, gt) => gt("Make sure {host} is awake and T3 Code is running on it.", { host: m[1]! }),
  ],
  [
    pattern(
      "A VPN or Tailscale exit node on (.+) can block the tunnel \\(port 7844\\)\\. Turn it off or allow the tunnel\\.",
    ),
    (m, gt) =>
      gt(
        "A VPN or Tailscale exit node on {host} can block the tunnel (port 7844). Turn it off or allow the tunnel.",
        { host: m[1]! },
      ),
  ],
  [
    pattern("Open or restart T3 Code on (.+)\\."),
    (m, gt) => gt("Open or restart T3 Code on {host}.", { host: m[1]! }),
  ],
  [
    pattern("Make sure (.+) is awake and online\\."),
    (m, gt) => gt("Make sure {host} is awake and online.", { host: m[1]! }),
  ],
  [
    pattern("If it keeps failing, remove (.+) from this device and add it again\\."),
    (m, gt) =>
      gt("If it keeps failing, remove {host} from this device and add it again.", { host: m[1]! }),
  ],
  [
    pattern("Make sure T3 Code is running on (.+)\\."),
    (m, gt) => gt("Make sure T3 Code is running on {host}.", { host: m[1]! }),
  ],

  // Connection status, compatibility, and connection errors.
  [
    pattern("Failed to connect\\. Reconnecting\\.\\.\\. Reason: (.+)"),
    (m, gt) =>
      gt("Failed to connect. Reconnecting... Reason: {reason}", {
        reason: localizeExternalMessage(m[1]!, gt),
      }),
  ],
  [
    pattern("Connection failed\\. Reason: (.+)"),
    (m, gt) =>
      gt("Connection failed. Reason: {reason}", { reason: localizeExternalMessage(m[1]!, gt) }),
  ],
  [
    pattern(
      "This client is not supported by this server\\. Update your app or use a compatible release to connect to (.+)\\.",
    ),
    (m, gt) =>
      gt(
        "This client is not supported by this server. Update your app or use a compatible release to connect to {host}.",
        { host: m[1]! },
      ),
  ],
  [
    pattern("This client requires a newer server\\. Update T3 Code on (.+) to connect\\."),
    (m, gt) =>
      gt("This client requires a newer server. Update T3 Code on {host} to connect.", {
        host: m[1]!,
      }),
  ],
  [
    pattern("Update T3 Code on (.+)\\."),
    (m, gt) => gt("Update T3 Code on {host}.", { host: m[1]! }),
  ],
  [
    pattern("(.+) did not answer on any saved route\\."),
    (m, gt) => gt("{host} did not answer on any saved route.", { host: m[1]! }),
  ],
  [
    pattern("(.+) connection failed unexpectedly\\."),
    (m, gt) => gt("{host} connection failed unexpectedly.", { host: m[1]! }),
  ],
  [
    pattern("(.+) did not respond to a connection health check\\."),
    (m, gt) => gt("{host} did not respond to a connection health check.", { host: m[1]! }),
  ],
  [
    pattern("(.+) froze for (\\d+)s"),
    (m, gt) => gt("{host} froze for {seconds}s", { host: m[1]!, seconds: m[2]! }),
  ],
  [
    pattern("Its CPU is overloaded \\(load (\\d+) on (\\d+) cores\\)\\."),
    (m, gt) =>
      gt("Its CPU is overloaded (load {load} on {cores} cores).", { load: m[1]!, cores: m[2]! }),
  ],
  [
    pattern("T3 Code on (.+) was too busy to answer\\."),
    (m, gt) => gt("T3 Code on {host} was too busy to answer.", { host: m[1]! }),
  ],

  // T3 Connect relay errors.
  [
    pattern("Relay rejected the environment link proof \\((.+)\\)\\."),
    (m, gt) => gt("Relay rejected the environment link proof ({reason}).", { reason: m[1]! }),
  ],
  [
    pattern("Relay rejected the environment connection request \\((.+)\\)\\."),
    (m, gt) =>
      gt("Relay rejected the environment connection request ({reason}).", { reason: m[1]! }),
  ],
  [
    pattern("Relay could not reach the environment endpoint \\((.+)\\)\\."),
    (m, gt) => gt("Relay could not reach the environment endpoint ({reason}).", { reason: m[1]! }),
  ],
  [
    pattern("Relay could not link the environment \\((.+)\\)\\."),
    (m, gt) => gt("Relay could not link the environment ({reason}).", { reason: m[1]! }),
  ],
  [
    pattern("Relay cannot provision the managed endpoint \\((.+)\\)\\. Failed stage: (.+)\\."),
    (m, gt) =>
      gt("Relay cannot provision the managed endpoint ({reason}). Failed stage: {stage}.", {
        reason: m[1]!,
        stage: m[2]!,
      }),
  ],
  [
    pattern("Relay cannot provision the managed endpoint \\((.+)\\)\\."),
    (m, gt) => gt("Relay cannot provision the managed endpoint ({reason}).", { reason: m[1]! }),
  ],
  [
    pattern(
      "Relay refused the link: this account already has its maximum of (\\d+) managed tunnels\\. Unlink an environment, or link a paid T3 Chat account in your T3 Connect account settings on web or desktop\\. Pro raises the default limit to (\\d+) and Premier to (\\d+)\\.",
    ),
    (m, gt) =>
      gt(
        "Relay refused the link: this account already has its maximum of {max} managed tunnels. Unlink an environment, or link a paid T3 Chat account in your T3 Connect account settings on web or desktop. Pro raises the default limit to {pro} and Premier to {premier}.",
        { max: m[1]!, pro: m[2]!, premier: m[3]! },
      ),
  ],
  [
    pattern(
      "Relay refused the link: this account already has its maximum of (\\d+) managed tunnels\\. Unlink an environment to free one up\\.",
    ),
    (m, gt) =>
      gt(
        "Relay refused the link: this account already has its maximum of {max} managed tunnels. Unlink an environment to free one up.",
        { max: m[1]! },
      ),
  ],
  [
    pattern("Relay rejected the agent activity publish proof \\((.+)\\)\\."),
    (m, gt) => gt("Relay rejected the agent activity publish proof ({reason}).", { reason: m[1]! }),
  ],
  [
    pattern("Relay encountered an internal error \\((.+)\\)\\."),
    (m, gt) => gt("Relay encountered an internal error ({reason}).", { reason: m[1]! }),
  ],
  [
    pattern("Relay returned an unexpected HTTP (\\d+)\\."),
    (m, gt) => gt("Relay returned an unexpected HTTP {status}.", { status: m[1]! }),
  ],

  // Thread execution, subagents, and background work.
  [
    pattern(`(Working|Waiting) ${DURATION}`),
    (m, gt) =>
      m[1] === "Working"
        ? gt("Working {duration}", { duration: localizeDuration(m[2]!, gt) })
        : gt("Waiting {duration}", { duration: localizeDuration(m[2]!, gt) }),
  ],
  [
    pattern(`Completed in ${DURATION}`),
    (m, gt) => gt("Completed in {duration}", { duration: localizeDuration(m[1]!, gt) }),
  ],
  [
    pattern("Starting ([A-Z][\\w.-]*(?: [A-Z][\\w.-]*)*)"),
    (m, gt) => gt("Starting {provider}", { provider: m[1]! }),
  ],
  [
    pattern("(\\d+) (side chat|subagent|thread)s need (input|approval|you)"),
    (m, gt) => childInputsTitle(m[2]!, m[3]!, m[1]!, gt),
  ],
  [pattern("Waiting · (.+)"), (m, gt) => gt("Waiting · {label}", { label: m[1]! })],
  [pattern("Running · (.+)"), (m, gt) => gt("Running · {label}", { label: m[1]! })],
  [
    pattern("(Waiting on|Running) ((?:\\d+ [a-z ]+)(?:(?:, | and )\\d+ [a-z ]+)*)"),
    (m, gt) => {
      const work = localizeBackgroundWorkGroups(m[2]!, gt);
      if (work === undefined) return m[0];
      return m[1] === "Running"
        ? gt("Running {work}", { work })
        : gt("Waiting on {work}", { work });
    },
  ],

  // Usage limits and usage progress.
  [
    pattern(`resets in ${DURATION}`),
    (m, gt) => gt("resets in {duration}", { duration: localizeDuration(m[1]!, gt) }),
  ],
  [
    pattern(`expires in ${DURATION}`),
    (m, gt) => gt("expires in {duration}", { duration: localizeDuration(m[1]!, gt) }),
  ],
  [
    pattern(`next expires in ${DURATION}`),
    (m, gt) => gt("next expires in {duration}", { duration: localizeDuration(m[1]!, gt) }),
  ],
  [pattern("(\\d+) left"), (m, gt) => gt("{count} left", { count: m[1]! })],
  [
    pattern("(5-hour reset|Weekly reset|Fable reset|Full reset): (.+) This cannot be undone\\."),
    (m, gt) =>
      gt("{option}: {description} This cannot be undone.", {
        option: localizeExternalMessage(m[1]!, gt),
        description: localizeExternalMessage(m[2]!, gt),
      }),
  ],
  [pattern("(\\d+) banked"), (m, gt) => gt("{count} banked", { count: m[1]! })],
  [pattern("1 reset credit banked"), (_m, gt) => gt("1 reset credit banked")],
  [
    pattern("(\\d+) reset credits banked"),
    (m, gt) => gt("{count} reset credits banked", { count: m[1]! }),
  ],
  [
    pattern("Updating (\\d+) providers…"),
    (m, gt) => gt("Updating {count} providers…", { count: m[1]! }),
  ],
  [
    pattern("Updating (\\d+) environments…"),
    (m, gt) => gt("Updating {count} environments…", { count: m[1]! }),
  ],
  [pattern("Updating (.+)…"), (m, gt) => gt("Updating {name}…", { name: m[1]! })],
  [
    pattern(
      "(\\d+) malformed or inconsistent usage record\\(s\\) were skipped; usage may be incomplete\\.",
    ),
    (m, gt) =>
      gt(
        "{count} malformed or inconsistent usage record(s) were skipped; usage may be incomplete.",
        { count: m[1]! },
      ),
  ],
  [
    pattern("(.+) runs an older server version and is excluded from totals\\."),
    (m, gt) =>
      gt("{environment} runs an older server version and is excluded from totals.", {
        environment: m[1]!,
      }),
  ],
  [
    pattern("This client is older than the server on (.+); its usage is excluded from totals\\."),
    (m, gt) =>
      gt(
        "This client is older than the server on {environment}; its usage is excluded from totals.",
        {
          environment: m[1]!,
        },
      ),
  ],

  // Managed policy.
  [
    pattern("(.+) limits threads to (Supervised|Auto-accept edits|Auto|Full access)\\."),
    (m, gt) =>
      gt("{organization} limits threads to {mode}.", {
        organization: m[1]!,
        mode: localizeExternalMessage(m[2]!, gt),
      }),
  ],
  [
    pattern("(.+) manages T3 Code updates\\. Only stable releases can be installed\\."),
    (m, gt) =>
      gt("{organization} manages T3 Code updates. Only stable releases can be installed.", {
        organization: m[1]!,
      }),
  ],
  [
    pattern("(.+) manages T3 Code updates\\."),
    (m, gt) => gt("{organization} manages T3 Code updates.", { organization: m[1]! }),
  ],

  // Project removal confirmation lines.
  [
    pattern('Remove (project|checkout) "(.+)" and delete its 1 thread\\?'),
    (m, gt) =>
      m[1] === "project"
        ? gt('Remove project "{name}" and delete its 1 thread?', { name: m[2]! })
        : gt('Remove checkout "{name}" and delete its 1 thread?', { name: m[2]! }),
  ],
  [
    pattern('Remove (project|checkout) "(.+)" and delete its (\\d+) threads\\?'),
    (m, gt) =>
      m[1] === "project"
        ? gt('Remove project "{name}" and delete its {count} threads?', {
            name: m[2]!,
            count: m[3]!,
          })
        : gt('Remove checkout "{name}" and delete its {count} threads?', {
            name: m[2]!,
            count: m[3]!,
          }),
  ],
  [
    pattern('Remove (project|checkout) "(.+)"\\?'),
    (m, gt) =>
      m[1] === "project"
        ? gt('Remove project "{name}"?', { name: m[2]! })
        : gt('Remove checkout "{name}"?', { name: m[2]! }),
  ],
  [pattern("Path: (.+)"), (m, gt) => gt("Path: {path}", { path: m[1]! })],
  [
    pattern("Environment: (.+)"),
    (m, gt) => gt("Environment: {environment}", { environment: m[1]! }),
  ],
  [
    pattern("This removes (\\d+) grouped project entries\\."),
    (m, gt) => gt("This removes {count} grouped project entries.", { count: m[1]! }),
  ],

  // Scheduled task webhooks.
  [
    pattern("Use at most (\\d+) filters\\."),
    (m, gt) => gt("Use at most {count} filters.", { count: m[1]! }),
  ],
  [
    pattern("Filter (\\d+) needs a path under body, headers or query\\."),
    (m, gt) => gt("Filter {index} needs a path under body, headers or query.", { index: m[1]! }),
  ],
  [
    pattern("Filter (\\d+) needs a path under body, headers or query, and at least one value\\."),
    (m, gt) =>
      gt("Filter {index} needs a path under body, headers or query, and at least one value.", {
        index: m[1]!,
      }),
  ],
  [
    pattern("Filter (\\d+) needs a path under body, headers or query, and a value\\."),
    (m, gt) =>
      gt("Filter {index} needs a path under body, headers or query, and a value.", {
        index: m[1]!,
      }),
  ],

  // Device and browser streams.
  [
    pattern("Device stream offer failed \\((\\d+)\\)\\. Retrying…"),
    (m, gt) => gt("Device stream offer failed ({status}). Retrying…", { status: m[1]! }),
  ],
  [
    pattern("Device lease ended: (.+)"),
    (m, gt) => gt("Device lease ended: {reason}", { reason: m[1]! }),
  ],

  // Timeline labels.
  [
    pattern(`Worked for ${DURATION}`),
    (m, gt) => gt("Worked for {duration}", { duration: localizeDuration(m[1]!, gt) }),
  ],
  [
    pattern(`You stopped after ${DURATION}`),
    (m, gt) => gt("You stopped after {duration}", { duration: localizeDuration(m[1]!, gt) }),
  ],
  [
    pattern(`Continued for ${DURATION}`),
    (m, gt) => gt("Continued for {duration}", { duration: localizeDuration(m[1]!, gt) }),
  ],
  [
    pattern(`Context compacted after ${DURATION} idle`),
    (m, gt) => gt("Context compacted after {age} idle", { age: localizeDuration(m[1]!, gt) }),
  ],
  [
    pattern(
      "(Context compacted|Context automatically compacted before cache expiry|Context compacted before sending) (\\S+) → (\\S+) tokens",
    ),
    (m, gt) =>
      m[1] === "Context compacted"
        ? gt("Context compacted {before} → {after} tokens", { before: m[2]!, after: m[3]! })
        : m[1] === "Context compacted before sending"
          ? gt("Context compacted before sending {before} → {after} tokens", {
              before: m[2]!,
              after: m[3]!,
            })
          : gt("Context automatically compacted before cache expiry {before} → {after} tokens", {
              before: m[2]!,
              after: m[3]!,
            }),
  ],
  [pattern("Thought \\(×(\\d+)\\)"), (m, gt) => gt("Thought (×{count})", { count: m[1]! })],
  [pattern("Changed (\\d+) files"), (m, gt) => gt("Changed {count} files", { count: m[1]! })],
  [pattern("(\\d+) changed files"), (m, gt) => gt("{count} changed files", { count: m[1]! })],
  [
    pattern("(\\d+)/(\\d+) completed"),
    (m, gt) => gt("{completed}/{total} completed", { completed: m[1]!, total: m[2]! }),
  ],
  [pattern("Read (\\d+) files"), (m, gt) => gt("Read {count} files", { count: m[1]! })],
  [pattern("Ran (\\d+) commands"), (m, gt) => gt("Ran {count} commands", { count: m[1]! })],
  [pattern("Created (\\d+) threads"), (m, gt) => gt("Created {count} threads", { count: m[1]! })],
  [pattern("Used (\\d+) tools"), (m, gt) => gt("Used {count} tools", { count: m[1]! })],
  [pattern("Received (\\d+) updates"), (m, gt) => gt("Received {count} updates", { count: m[1]! })],
  [
    pattern("Performed (\\d+) other actions"),
    (m, gt) => gt("Performed {count} other actions", { count: m[1]! }),
  ],
  [
    pattern("Used device controls (\\d+) times"),
    (m, gt) => gt("Used device controls {count} times", { count: m[1]! }),
  ],
  [
    pattern("Used browser (\\d+) times"),
    (m, gt) => gt("Used browser {count} times", { count: m[1]! }),
  ],
  [
    pattern("Searched the web (\\d+) times"),
    (m, gt) => gt("Searched the web {count} times", { count: m[1]! }),
  ],
  [
    pattern("Searched code (\\d+) times"),
    (m, gt) => gt("Searched code {count} times", { count: m[1]! }),
  ],
  [
    pattern("Linked (\\d+) pull requests"),
    (m, gt) => gt("Linked {count} pull requests", { count: m[1]! }),
  ],
  [
    pattern("Unlinked (\\d+) pull requests"),
    (m, gt) => gt("Unlinked {count} pull requests", { count: m[1]! }),
  ],
  [
    pattern("Watching (\\d+) pull requests"),
    (m, gt) => gt("Watching {count} pull requests", { count: m[1]! }),
  ],
  [
    pattern("Stopped watching (\\d+) pull requests"),
    (m, gt) => gt("Stopped watching {count} pull requests", { count: m[1]! }),
  ],
  [
    pattern("Checked linked pull requests (\\d+) times"),
    (m, gt) => gt("Checked linked pull requests {count} times", { count: m[1]! }),
  ],
  [
    pattern("(Running|Ran|Failed|Declined|Stopped) (\\S+)"),
    (m, gt) => commandStatusLabel(m[1]!, m[2]!, gt),
  ],

  // Provider status, compatibility, update, and sign-in messages sent by the server.
  [
    pattern(
      "Could not start Codex CLI \\(`(.+)`\\)\\. Check Settings → Providers → Codex → Binary path on the server\\. Installing ChatGPT or Codex desktop may not add codex to PATH\\.",
    ),
    (m, gt) =>
      gt(
        "Could not start Codex CLI (`{binaryPath}`). Check Settings → Providers → Codex → Binary path on the server. Installing ChatGPT or Codex desktop may not add codex to PATH.",
        { binaryPath: m[1]! },
      ),
  ],
  [
    pattern(
      "Could not start Codex CLI \\(`(.+)`\\)\\. Check Settings → Providers → Codex → Binary path on the server\\. Make sure the configured executable exists and can be run\\.",
    ),
    (m, gt) =>
      gt(
        "Could not start Codex CLI (`{binaryPath}`). Check Settings → Providers → Codex → Binary path on the server. Make sure the configured executable exists and can be run.",
        { binaryPath: m[1]! },
      ),
  ],
  [
    pattern(
      "Codex CLI is not authenticated\\. Run `codex login` with CODEX_HOME set to (.+) and try again\\.",
    ),
    (m, gt) =>
      gt(
        "Codex CLI is not authenticated. Run `codex login` with CODEX_HOME set to {path} and try again.",
        { path: m[1]! },
      ),
  ],
  [
    pattern("Codex app-server provider probe failed: (.+)\\."),
    (m, gt) => gt("Codex app-server provider probe failed: {error}.", { error: m[1]! }),
  ],
  [
    pattern("Timed out after (\\d+(?:\\.\\d+)?)s while checking Claude account status\\."),
    (m, gt) =>
      gt("Timed out after {seconds}s while checking Claude account status.", { seconds: m[1]! }),
  ],
  [
    pattern(
      "Claude could not authenticate\\. For subscription login, run `claude auth login` on this environment's machine, then start a new thread\\. For API-key authentication, check this instance's configured credentials\\.",
    ),
    (_m, gt) =>
      gt(
        "Claude could not authenticate. For subscription login, run `claude auth login` on this environment's machine, then start a new thread. For API-key authentication, check this instance's configured credentials.",
      ),
  ],
  [
    pattern(
      "Claude could not authenticate\\. For subscription login, run `claude auth login` on this environment's machine from (.+), with CLAUDE_CONFIG_DIR set to (.+), then start a new thread\\. For API-key authentication, check this instance's configured credentials\\.",
    ),
    (m, gt) =>
      gt(
        "Claude could not authenticate. For subscription login, run `claude auth login` on this environment's machine from {cwd}, with CLAUDE_CONFIG_DIR set to {configDir}, then start a new thread. For API-key authentication, check this instance's configured credentials.",
        { cwd: m[1]!, configDir: m[2]! },
      ),
  ],
  [
    pattern(
      "Claude Code (v\\S+|the installed version) is too old for (.+)\\. Upgrade to v(\\S+) or newer to access it\\.",
    ),
    (m, gt) =>
      m[1] === "the installed version"
        ? gt(
            "Claude Code the installed version is too old for {model}. Upgrade to v{minVersion} or newer to access it.",
            { model: m[2]!, minVersion: m[3]! },
          )
        : gt(
            "Claude Code {version} is too old for {model}. Upgrade to v{minVersion} or newer to access it.",
            { version: m[1]!, model: m[2]!, minVersion: m[3]! },
          ),
  ],
  [
    pattern("Connect with (.+) to use Antigravity and load models\\."),
    (m, gt) =>
      gt("Connect with {method} to use Antigravity and load models.", {
        method: localizeExternalMessage(m[1]!, gt),
      }),
  ],
  [
    pattern("Antigravity is installed\\. Connect with (.+) to load models\\."),
    (m, gt) =>
      gt("Antigravity is installed. Connect with {method} to load models.", {
        method: localizeExternalMessage(m[1]!, gt),
      }),
  ],
  [
    pattern("Antigravity did not respond to its local health check within (\\d+) seconds\\."),
    (m, gt) =>
      gt("Antigravity did not respond to its local health check within {seconds} seconds.", {
        seconds: m[1]!,
      }),
  ],
  [
    pattern("Cursor SDK catalog request timed out after (\\d+)ms\\."),
    (m, gt) => gt("Cursor SDK catalog request timed out after {ms}ms.", { ms: m[1]! }),
  ],
  [
    pattern(
      "Couldn't reach the configured OpenCode server at (.+)\\. Check that the server is running and the URL is correct\\.",
    ),
    (m, gt) =>
      gt(
        "Couldn't reach the configured OpenCode server at {url}. Check that the server is running and the URL is correct.",
        { url: m[1]! },
      ),
  ],
  [
    pattern(
      "(Failed to load OpenCode provider inventory|Failed to execute OpenCode CLI health check): (.+)",
    ),
    (m, gt) =>
      m[1] === "Failed to load OpenCode provider inventory"
        ? gt("Failed to load OpenCode provider inventory: {detail}", { detail: m[2]! })
        : gt("Failed to execute OpenCode CLI health check: {detail}", { detail: m[2]! }),
  ],
  [
    pattern("OpenCode (\\S+) lists 1 model\\."),
    (m, gt) => gt("OpenCode {version} lists 1 model.", { version: m[1]! }),
  ],
  [
    pattern("OpenCode (\\S+) lists (\\d+) models\\."),
    (m, gt) => gt("OpenCode {version} lists {count} models.", { version: m[1]!, count: m[2]! }),
  ],
  [
    pattern("OpenCode v(\\S+) is too old\\. Upgrade to v(\\S+) or newer\\."),
    (m, gt) =>
      gt("OpenCode v{version} is too old. Upgrade to v{minVersion} or newer.", {
        version: m[1]!,
        minVersion: m[2]!,
      }),
  ],
  [
    pattern("1 upstream provider connected through (the configured OpenCode server|OpenCode)\\."),
    (m, gt) =>
      m[1] === "OpenCode"
        ? gt("1 upstream provider connected through OpenCode.")
        : gt("1 upstream provider connected through the configured OpenCode server."),
  ],
  [
    pattern(
      "(\\d+) upstream providers connected through (the configured OpenCode server|OpenCode)\\.",
    ),
    (m, gt) =>
      m[2] === "OpenCode"
        ? gt("{count} upstream providers connected through OpenCode.", { count: m[1]! })
        : gt("{count} upstream providers connected through the configured OpenCode server.", {
            count: m[1]!,
          }),
  ],
  [
    pattern("(Your organization|.+'s) policy does not allow the (.+) provider\\."),
    (m, gt) =>
      m[1] === "Your organization"
        ? gt("Your organization policy does not allow the {provider} provider.", {
            provider: m[2]!,
          })
        : gt("{organization}'s policy does not allow the {provider} provider.", {
            organization: m[1]!.slice(0, -2),
            provider: m[2]!,
          }),
  ],
  [
    pattern("Driver '(.+)' is not registered in this build\\."),
    (m, gt) => gt("Driver ''{driver}'' is not registered in this build.", { driver: m[1]! }),
  ],
  [
    pattern("Could not read (.+) from its secret provider\\. Unlock it, then refresh\\."),
    (m, gt) =>
      gt("Could not read {secrets} from its secret provider. Unlock it, then refresh.", {
        secrets: m[1]!,
      }),
  ],
  [
    pattern("Driver '(.+)' failed to create instance: (.+)"),
    (m, gt) =>
      gt("Driver ''{driver}'' failed to create instance: {detail}", {
        driver: m[1]!,
        detail: localizeExternalMessage(m[2]!, gt),
      }),
  ],
  [pattern("Running (.+)"), (m, gt) => gt("Running {command}", { command: m[1]! })],
  [
    pattern("Update timed out after (\\d+) minutes\\."),
    (m, gt) => gt("Update timed out after {minutes} minutes.", { minutes: m[1]! }),
  ],
  [
    pattern("Update command exited with code (-?\\d+)\\."),
    (m, gt) => gt("Update command exited with code {code}.", { code: m[1]! }),
  ],
  [
    pattern("Update command exited with code (-?\\d+): (.+)"),
    (m, gt) =>
      gt("Update command exited with code {code}: {reason}", { code: m[1]!, reason: m[2]! }),
  ],
  [
    pattern("Update command failed: (.+)"),
    (m, gt) => gt("Update command failed: {reason}", { reason: m[1]! }),
  ],
  [
    pattern(
      "(.+) Homebrew's local package metadata may be stale\\. Run brew update && (.+) on this environment's host, then refresh provider status\\.",
    ),
    (m, gt) =>
      gt(
        "{advisory} Homebrew's local package metadata may be stale. Run brew update && {command} on this environment's host, then refresh provider status.",
        { advisory: localizeExternalMessage(m[1]!, gt), command: m[2]! },
      ),
  ],
  [
    pattern(
      "(This provider version is known to be incompatible with this T3 Code release\\.|This provider version is outside the supported range for this T3 Code release\\.|This provider version has limited compatibility with this T3 Code release\\.) Use (.+)\\.",
    ),
    (m, gt) =>
      gt("{advisory} Use {recommendation}.", {
        advisory: localizeExternalMessage(m[1]!, gt),
        recommendation: m[2]!,
      }),
  ],
];

const BACKGROUND_WORK_FALLBACK_LABELS = {
  subagent: "subagent",
  command: "command",
  monitor: "monitor",
  background_task: "background task",
} as const;

/** Unnamed background work items carry the English kind noun as their label. */
export function localizeBackgroundWorkItemLabel(
  item: { readonly kind: keyof typeof BACKGROUND_WORK_FALLBACK_LABELS; readonly label: string },
  gt: Translate,
): string {
  if (item.label !== BACKGROUND_WORK_FALLBACK_LABELS[item.kind]) return item.label;
  switch (item.kind) {
    case "subagent":
      return gt("subagent");
    case "command":
      return gt("command");
    case "monitor":
      return gt("monitor");
    case "background_task":
      return gt("background task");
  }
}

function childInputsTitle(noun: string, need: string, count: string, gt: Translate): string {
  const values = { count };
  if (noun === "side chat") {
    if (need === "input") return gt("{count} side chats need input", values);
    if (need === "approval") return gt("{count} side chats need approval", values);
    return gt("{count} side chats need you", values);
  }
  if (noun === "subagent") {
    if (need === "input") return gt("{count} subagents need input", values);
    if (need === "approval") return gt("{count} subagents need approval", values);
    return gt("{count} subagents need you", values);
  }
  if (need === "input") return gt("{count} threads need input", values);
  if (need === "approval") return gt("{count} threads need approval", values);
  return gt("{count} threads need you", values);
}

function localizeBackgroundWorkGroups(groups: string, gt: Translate): string | undefined {
  const parts = groups.split(/, | and /);
  const localized: string[] = [];
  for (const part of parts) {
    const match = /^(\d+) (.+)$/.exec(part);
    if (!match) return undefined;
    const count = match[1]!;
    const values = { count };
    switch (match[2]) {
      case "subagent":
        localized.push(gt("1 subagent"));
        break;
      case "subagents":
        localized.push(gt("{count} subagents", values));
        break;
      case "command":
        localized.push(gt("1 command"));
        break;
      case "commands":
        localized.push(gt("{count} commands", values));
        break;
      case "monitor":
        localized.push(gt("1 monitor"));
        break;
      case "monitors":
        localized.push(gt("{count} monitors", values));
        break;
      case "background task":
        localized.push(gt("1 background task"));
        break;
      case "background tasks":
        localized.push(gt("{count} background tasks", values));
        break;
      default:
        return undefined;
    }
  }
  if (localized.length === 1) return localized[0];
  const last = localized.pop()!;
  const list = localized.reduce((joined, item) => gt("{list}, {item}", { list: joined, item }));
  return gt("{first} and {second}", { first: list, second: last });
}

function commandStatusLabel(verb: string, program: string, gt: Translate): string {
  const values = { program };
  if (program === "command") {
    if (verb === "Running") return gt("Running command");
    if (verb === "Ran") return gt("Ran command");
    if (verb === "Failed") return gt("Failed command");
    if (verb === "Declined") return gt("Declined command");
    return gt("Stopped command");
  }
  if (verb === "Running") return gt("Running {program}", values);
  if (verb === "Ran") return gt("Ran {program}", values);
  if (verb === "Failed") return gt("Failed {program}", values);
  if (verb === "Declined") return gt("Declined {program}", values);
  return gt("Stopped {program}", values);
}

function exactMessage(message: string, gt: Translate): string | undefined {
  switch (message) {
    // Git quick actions and disabled reasons.
    case "Commit":
      return gt("Commit");
    case "Commit & push":
      return gt("Commit & push");
    case "Push":
      return gt("Push");
    case "Pull":
      return gt("Pull");
    case "Sync branch":
      return gt("Sync branch");
    case "Git action in progress.":
      return gt("Git action in progress.");
    case "Git status is unavailable.":
      return gt("Git status is unavailable.");
    case "No local commits to push.":
      return gt("No local commits to push.");
    case "Branch has diverged from upstream. Rebase/merge first.":
      return gt("Branch has diverged from upstream. Rebase/merge first.");
    case "Branch is up to date. No action needed.":
      return gt("Branch is up to date. No action needed.");
    case "Worktree is clean. Make changes before committing.":
      return gt("Worktree is clean. Make changes before committing.");
    case "Commit is currently unavailable.":
      return gt("Commit is currently unavailable.");
    case "Detached HEAD: checkout a branch before pushing.":
      return gt("Detached HEAD: checkout a branch before pushing.");
    case "Commit or stash local changes before pushing.":
      return gt("Commit or stash local changes before pushing.");
    case "Branch is behind upstream. Pull/rebase before pushing.":
      return gt("Branch is behind upstream. Pull/rebase before pushing.");
    case 'Add an "origin" remote before pushing.':
      return gt('Add an "origin" remote before pushing.');
    case "Push is currently unavailable.":
      return gt("Push is currently unavailable.");
    case "Commit & push to default branch?":
      return gt("Commit & push to default branch?");
    case "Push to default branch?":
      return gt("Push to default branch?");

    // Connection diagnosis.
    case "This device is offline":
      return gt("This device is offline");
    case "This device is still loading its T3 Connect sign-in":
      return gt("This device is still loading its T3 Connect sign-in");
    case "This device's clock is off":
      return gt("This device's clock is off");
    case "T3 Connect returned an error":
      return gt("T3 Connect returned an error");
    case "This device could not prepare the connection":
      return gt("This device could not prepare the connection");
    case "T3 Connect did not accept this device's sign-in":
      return gt("T3 Connect did not accept this device's sign-in");
    case "This device can't reach T3 Connect":
      return gt("This device can't reach T3 Connect");
    case "Connect this device to the internet. T3 Code reconnects on its own.":
      return gt("Connect this device to the internet. T3 Code reconnects on its own.");
    case "Wait a moment. T3 Code retries on its own.":
      return gt("Wait a moment. T3 Code retries on its own.");
    case "If it keeps waiting, reload or restart T3 Code on this device.":
      return gt("If it keeps waiting, reload or restart T3 Code on this device.");
    case "Check that this device is signed in to the same T3 Connect account as the host.":
      return gt("Check that this device is signed in to the same T3 Connect account as the host.");
    case "Wait a minute. T3 Code retries on its own.":
      return gt("Wait a minute. T3 Code retries on its own.");
    case "Wait a few minutes. T3 Code retries on its own.":
      return gt("Wait a few minutes. T3 Code retries on its own.");
    case "If it keeps failing, copy the diagnostics and report it.":
      return gt("If it keeps failing, copy the diagnostics and report it.");
    case "Restart T3 Code on this device.":
      return gt("Restart T3 Code on this device.");
    case "Sign out of T3 Connect and sign in again.":
      return gt("Sign out of T3 Connect and sign in again.");
    case "Check this device's internet connection.":
      return gt("Check this device's internet connection.");
    case "A VPN, firewall, or ad blocker on this device can block T3 Connect.":
      return gt("A VPN, firewall, or ad blocker on this device can block T3 Connect.");
    case "A VPN, firewall, or DNS filter on this device can block the tunnel.":
      return gt("A VPN, firewall, or DNS filter on this device can block the tunnel.");
    case "Try another network, or add a direct route such as a Tailscale address.":
      return gt("Try another network, or add a direct route such as a Tailscale address.");
    case "Retry. If it keeps failing, copy the diagnostics.":
      return gt("Retry. If it keeps failing, copy the diagnostics.");
    case "This device":
      return gt("This device");
    case "Cause":
      return gt("Cause");
    case "HTTP status":
      return gt("HTTP status");
    case "Attempts":
      return gt("Attempts");
    case "Next retry":
      return gt("Next retry");
    case "Route":
      return gt("Route");
    case "Direct":
      return gt("Direct");
    case "App version":
      return gt("App version");
    case "Host version":
      return gt("Host version");
    case "Error":
      return gt("Error");
    case "Trace ID":
      return gt("Trace ID");

    // Connection status and errors.
    case "Off":
      return gt("Off");
    case "Available":
      return gt("Available");
    case "Offline":
      return gt("Offline");
    case "Connecting...":
      return gt("Connecting...");
    case "Reconnecting...":
      return gt("Reconnecting...");
    case "Connected":
      return gt("Connected");
    case "Client not supported":
      return gt("Client not supported");
    case "Connection failed":
      return gt("Connection failed");
    case "Waiting for approval on the host":
      return gt("Waiting for approval on the host");
    case "Waiting for approval":
      return gt("Waiting for approval");
    case "Failed to connect. Reconnecting...":
      return gt("Failed to connect. Reconnecting...");
    case "Available · Relay online":
      return gt("Available · Relay online");
    case "Available · Checking relay status...":
      return gt("Available · Checking relay status...");
    case "Available · Relay status unknown":
      return gt("Available · Relay status unknown");
    case "Relay is offline.":
      return gt("Relay is offline.");
    case "The environment credential is invalid.":
      return gt("The environment credential is invalid.");
    case "The environment credential does not grant the required access.":
      return gt("The environment credential does not grant the required access.");
    case "The environment rejected the authentication request.":
      return gt("The environment rejected the authentication request.");
    case "The environment endpoint could not be found.":
      return gt("The environment endpoint could not be found.");
    case "This device is waiting for approval on the host.":
      return gt("This device is waiting for approval on the host.");
    case "The environment could not authorize the connection.":
      return gt("The environment could not authorize the connection.");

    // T3 Connect relay errors.
    case "Hint: Check that automatic date and time is enabled on both devices, then try again.":
      return gt(
        "Hint: Check that automatic date and time is enabled on both devices, then try again.",
      );
    case "Hint: Try again. If it still fails, clock skew may be the cause; check that automatic date and time is enabled on both devices.":
      return gt(
        "Hint: Try again. If it still fails, clock skew may be the cause; check that automatic date and time is enabled on both devices.",
      );
    case "Hint: Try again. If the problem continues, copy the trace ID.":
      return gt("Hint: Try again. If the problem continues, copy the trace ID.");
    case "Relay rejected the cloud session token.":
      return gt("Relay rejected the cloud session token.");
    case "Relay rejected the DPoP proof.":
      return gt("Relay rejected the DPoP proof.");
    case "Relay rejected the authenticated request.":
      return gt("Relay rejected the authenticated request.");
    case "Relay rejected an expired environment link proof.":
      return gt("Relay rejected an expired environment link proof.");
    case "Relay has no active link for this environment. If it was deregistered from T3 Connect, link it again on that machine.":
      return gt(
        "Relay has no active link for this environment. If it was deregistered from T3 Connect, link it again on that machine.",
      );
    case "The environment's T3 Connect tunnel is still being set up.":
      return gt("The environment's T3 Connect tunnel is still being set up.");
    case "This environment is linked only to publish agent activity, so it cannot accept connections. On that computer, open Settings > Sharing & access and turn T3 Connect on.":
      return gt(
        "This environment is linked only to publish agent activity, so it cannot accept connections. On that computer, open Settings > Sharing & access and turn T3 Connect on.",
      );
    case "Relay rejected the environment connection request.":
      return gt("Relay rejected the environment connection request.");
    case "Relay timed out while contacting the environment endpoint.":
      return gt("Relay timed out while contacting the environment endpoint.");
    case "Relay rejected an expired agent activity publish proof.":
      return gt("Relay rejected an expired agent activity publish proof.");
    case "Relay timed out before it finished the request (HTTP 504). Try again in a few minutes. If it keeps failing, copy the trace ID when you report it.":
      return gt(
        "Relay timed out before it finished the request (HTTP 504). Try again in a few minutes. If it keeps failing, copy the trace ID when you report it.",
      );
    case "Offline for a while, so its T3 Connect tunnel was removed. Start T3 Code on that computer and update it to the latest version to reconnect.":
      return gt(
        "Offline for a while, so its T3 Connect tunnel was removed. Start T3 Code on that computer and update it to the latest version to reconnect.",
      );

    // Voice input.
    case "Microphone access is required for voice input. Allow access in your browser or system settings and try again.":
      return gt(
        "Microphone access is required for voice input. Allow access in your browser or system settings and try again.",
      );
    case "Microphone access is required for voice input.":
      return gt("Microphone access is required for voice input.");
    case "Voice transcription is still finishing. Try again shortly.":
      return gt("Voice transcription is still finishing. Try again shortly.");
    case "Voice transcription is not available for this language.":
      return gt("Voice transcription is not available for this language.");
    case "Could not prepare voice transcription.":
      return gt("Could not prepare voice transcription.");
    case "Could not transcribe this recording.":
      return gt("Could not transcribe this recording.");
    case "This draft is no longer available.":
      return gt("This draft is no longer available.");
    case "Another voice recording is already active.":
      return gt("Another voice recording is already active.");
    case "Voice transcription is not available.":
      return gt("Voice transcription is not available.");
    case "Could not start voice recording.":
      return gt("Could not start voice recording.");
    case "Voice recording was interrupted.":
      return gt("Voice recording was interrupted.");
    case "Voice input stopped when the app moved to the background.":
      return gt("Voice input stopped when the app moved to the background.");
    case "Could not finish voice recording.":
      return gt("Could not finish voice recording.");
    case "The draft changed while voice input was running. The transcript was not added.":
      return gt("The draft changed while voice input was running. The transcript was not added.");
    case "No speech was detected.":
      return gt("No speech was detected.");
    case "Live transcription stopped responding.":
      return gt("Live transcription stopped responding.");
    case "Voice transcription was cancelled.":
      return gt("Voice transcription was cancelled.");
    case "The voice connection closed. Please record again.":
      return gt("The voice connection closed. Please record again.");
    case "Could not connect to live transcription.":
      return gt("Could not connect to live transcription.");
    case "Voice recordings are limited to five minutes.":
      return gt("Voice recordings are limited to five minutes.");
    case "Could not send microphone audio.":
      return gt("Could not send microphone audio.");
    case "Could not finish live transcription.":
      return gt("Could not finish live transcription.");

    // Threads, queue, subagents, and background work.
    case "Answer the question to edit queued messages":
      return gt("Answer the question to edit queued messages");
    case "Side chat needs input":
      return gt("Side chat needs input");
    case "Side chat needs approval":
      return gt("Side chat needs approval");
    case "Side chat needs you":
      return gt("Side chat needs you");
    case "Subagent needs input":
      return gt("Subagent needs input");
    case "Subagent needs approval":
      return gt("Subagent needs approval");
    case "Subagent needs you":
      return gt("Subagent needs you");
    case "Starting":
      return gt("Starting");
    case "Idle":
      return gt("Idle");
    case "Working":
      return gt("Working");
    case "Waiting":
      return gt("Waiting");
    case "Completed":
      return gt("Completed");
    case "Interrupted":
      return gt("Interrupted");
    case "Failed":
      return gt("Failed");
    case "Cancelled":
      return gt("Cancelled");
    case "Waiting on a subagent":
      return gt("Waiting on a subagent");
    case "Waiting on a command":
      return gt("Waiting on a command");
    case "Waiting on a monitor":
      return gt("Waiting on a monitor");
    case "Waiting on a background task":
      return gt("Waiting on a background task");
    case "Running a subagent":
      return gt("Running a subagent");
    case "Running a command":
      return gt("Running a command");
    case "Running a monitor":
      return gt("Running a monitor");
    case "Running a background task":
      return gt("Running a background task");
    case "Pursuing goal":
      return gt("Pursuing goal");
    case "Goal paused":
      return gt("Goal paused");
    case "Goal blocked":
      return gt("Goal blocked");
    case "Goal hit a usage limit":
      return gt("Goal hit a usage limit");
    case "Goal reached its token budget":
      return gt("Goal reached its token budget");
    case "Goal complete":
      return gt("Goal complete");
    case "Goal set":
      return gt("Goal set");
    case "Could not synchronize the thread.":
      return gt("Could not synchronize the thread.");
    case "Could not load earlier activity.":
      return gt("Could not load earlier activity.");
    case "Work history changed. Retry loading it.":
      return gt("Work history changed. Retry loading it.");
    case "Environment is not connected.":
      return gt("Environment is not connected.");
    case "History did not advance.":
      return gt("History did not advance.");
    case "Work history did not advance.":
      return gt("Work history did not advance.");
    case "Fetch base branch":
      return gt("Fetch base branch");
    case "Check out files":
      return gt("Check out files");
    case "Init submodules":
      return gt("Init submodules");
    case "Run setup script":
      return gt("Run setup script");
    case "Start agent":
      return gt("Start agent");
    case "Connecting":
      return gt("Connecting");
    case "Counting objects":
      return gt("Counting objects");
    case "Receiving objects":
      return gt("Receiving objects");
    case "Resolving deltas":
      return gt("Resolving deltas");
    case "Checking out files":
      return gt("Checking out files");
    case "Stalled":
      return gt("Stalled");
    case "Supervised":
      return gt("Supervised");
    case "Auto-accept edits":
      return gt("Auto-accept edits");
    case "Auto":
      return gt("Auto");
    case "Full access":
      return gt("Full access");
    case "This connection cannot read host files. Pair again with a new link to view it.":
      return gt("This connection cannot read host files. Pair again with a new link to view it.");

    // Usage limits.
    case "resets now":
      return gt("resets now");
    case "Resets momentarily":
      return gt("Resets momentarily");
    case "No reset credits banked":
      return gt("No reset credits banked");
    case "Use":
      return gt("Use");
    case "Use reset":
      return gt("Use reset");
    case "5-hour reset":
      return gt("5-hour reset");
    case "Weekly reset":
      return gt("Weekly reset");
    case "Fable reset":
      return gt("Fable reset");
    case "Full reset":
      return gt("Full reset");
    case "Refills your 5-hour limit.":
      return gt("Refills your 5-hour limit.");
    case "Refills your weekly limit.":
      return gt("Refills your weekly limit.");
    case "Refills your Fable allowance and gives back what Fable used on your weekly limit. It doesn't reset your whole week.":
      return gt(
        "Refills your Fable allowance and gives back what Fable used on your weekly limit. It doesn't reset your whole week.",
      );
    case "Refills your 5-hour and weekly limits.":
      return gt("Refills your 5-hour and weekly limits.");
    case "This redeems one credit on your account and clears the current rate-limit windows. It cannot be undone.":
      return gt(
        "This redeems one credit on your account and clears the current rate-limit windows. It cannot be undone.",
      );
    case "This account has no subscription limits.":
      return gt("This account has no subscription limits.");
    case "Could not read limits.":
      return gt("Could not read limits.");
    case "No limits reported.":
      return gt("No limits reported.");
    case "Updating…":
      return gt("Updating…");

    // Session permissions.
    case "View environment":
      return gt("View environment");
    case "Operate tasks":
      return gt("Operate tasks");
    case "Change environment settings":
      return gt("Change environment settings");
    case "Manage providers":
      return gt("Manage providers");
    case "Maintain environment":
      return gt("Maintain environment");
    case "Control previews":
      return gt("Control previews");
    case "View diagnostics and usage":
      return gt("View diagnostics and usage");
    case "View terminals":
      return gt("View terminals");
    case "Use terminals":
      return gt("Use terminals");
    case "Change source control":
      return gt("Change source control");
    case "Read files":
      return gt("Read files");
    case "Write files":
      return gt("Write files");
    case "View access":
      return gt("View access");
    case "Manage access":
      return gt("Manage access");
    case "View relay":
      return gt("View relay");
    case "Manage relay":
      return gt("Manage relay");
    case "Connect to this environment to view this session’s permissions.":
      return gt("Connect to this environment to view this session’s permissions.");
    case "This environment did not accept your session. Reconnect to try again.":
      return gt("This environment did not accept your session. Reconnect to try again.");
    case "Could not verify your permissions. Retrying automatically.":
      return gt("Could not verify your permissions. Retrying automatically.");
    case "Checking permissions…":
      return gt("Checking permissions…");

    // Project removal.
    case "Those threads and any archived threads are deleted from T3 Code. Provider sessions are kept.":
      return gt(
        "Those threads and any archived threads are deleted from T3 Code. Provider sessions are kept.",
      );
    case "Any archived threads are deleted from T3 Code. Provider sessions are kept.":
      return gt("Any archived threads are deleted from T3 Code. Provider sessions are kept.");
    case "This removes only the project entries, not the files on disk.":
      return gt("This removes only the project entries, not the files on disk.");
    case "Other entries in this grouped project are unaffected.":
      return gt("Other entries in this grouped project are unaffected.");
    case "This action cannot be undone.":
      return gt("This action cannot be undone.");

    // Scheduled task webhooks.
    case "Link this environment to T3 Connect for a public URL.":
      return gt("Link this environment to T3 Connect for a public URL.");
    case "Only this computer can call this address. Link T3 Connect for a public URL.":
      return gt("Only this computer can call this address. Link T3 Connect for a public URL.");
    case "Works wherever this environment's address is reachable, for example over Tailscale or your own proxy. Link T3 Connect for a public URL.":
      return gt(
        "Works wherever this environment's address is reachable, for example over Tailscale or your own proxy. Link T3 Connect for a public URL.",
      );

    // Browser preview and device streams.
    case "Read-only":
      return gt("Read-only");
    case "You have control":
      return gt("You have control");
    case "Agent has control":
      return gt("Agent has control");
    case "Another viewer has control":
      return gt("Another viewer has control");
    case "Watching":
      return gt("Watching");
    case "This server's host blocks the sandbox its browser runs in. Run this once on the host, then try again:":
      return gt(
        "This server's host blocks the sandbox its browser runs in. Run this once on the host, then try again:",
      );
    case "This server's host is missing libraries its browser needs. Run this once on the host, then try again:":
      return gt(
        "This server's host is missing libraries its browser needs. Run this once on the host, then try again:",
      );
    case "No video received from the device. Reconnect to try again.":
      return gt("No video received from the device. Reconnect to try again.");
    case "Could not receive the device stream. Reconnect to try again.":
      return gt("Could not receive the device stream. Reconnect to try again.");
    case "Could not display the device stream. Reconnect to try again.":
      return gt("Could not display the device stream. Reconnect to try again.");
    case "Video decoder restarted.":
      return gt("Video decoder restarted.");
    case "This browser cannot play this device's WebRTC stream.":
      return gt("This browser cannot play this device's WebRTC stream.");
    case "This Device Hub does not provide fixed Duo display feeds.":
      return gt("This Device Hub does not provide fixed Duo display feeds.");
    case "Device stream stopped receiving video. Reconnecting…":
      return gt("Device stream stopped receiving video. Reconnecting…");
    case "Video decoder fell behind. Reconnecting…":
      return gt("Video decoder fell behind. Reconnecting…");
    case "Device stream stalled. Reconnecting…":
      return gt("Device stream stalled. Reconnecting…");
    case "Device stream connection failed. Reconnecting…":
      return gt("Device stream connection failed. Reconnecting…");
    case "Device stream found no network candidates yet. Retrying…":
      return gt("Device stream found no network candidates yet. Retrying…");
    case "Device stream returned an invalid answer. Retrying…":
      return gt("Device stream returned an invalid answer. Retrying…");
    case "Switching to WebRTC.":
      return gt("Switching to WebRTC.");
    case "This browser cannot receive the device's WebRTC stream.":
      return gt("This browser cannot receive the device's WebRTC stream.");
    case "This browser cannot decode the Android stream (WebCodecs unavailable).":
      return gt("This browser cannot decode the Android stream (WebCodecs unavailable).");
    case "This browser cannot decode this device's stream (WebCodecs unavailable).":
      return gt("This browser cannot decode this device's stream (WebCodecs unavailable).");

    // Timeline labels.
    case "Thinking":
      return gt("Thinking");
    case "Thought":
      return gt("Thought");
    case "Worked":
      return gt("Worked");
    case "You stopped this response":
      return gt("You stopped this response");
    case "Continued":
      return gt("Continued");
    case "Earlier work":
      return gt("Earlier work");
    case "Compacting…":
      return gt("Compacting…");
    case "Compacting before the cache expires…":
      return gt("Compacting before the cache expires…");
    case "Context compacted":
      return gt("Context compacted");
    case "Context compaction failed":
      return gt("Context compaction failed");
    case "Context compaction stopped":
      return gt("Context compaction stopped");
    case "Compacting context":
      return gt("Compacting context");
    case "Context automatically compacted before cache expiry":
      return gt("Context automatically compacted before cache expiry");
    case "Context compacted before sending":
      return gt("Context compacted before sending");
    case "Read file":
      return gt("Read file");
    case "Read 1 file":
      return gt("Read 1 file");
    case "Changed 1 file":
      return gt("Changed 1 file");
    case "Ran 1 command":
      return gt("Ran 1 command");
    case "Created 1 thread":
      return gt("Created 1 thread");
    case "Used 1 tool":
      return gt("Used 1 tool");
    case "Received 1 update":
      return gt("Received 1 update");
    case "Performed 1 other action":
      return gt("Performed 1 other action");
    case "Used device controls 1 time":
      return gt("Used device controls 1 time");
    case "Used browser 1 time":
      return gt("Used browser 1 time");
    case "Searched the web 1 time":
      return gt("Searched the web 1 time");
    case "Searched code 1 time":
      return gt("Searched code 1 time");
    case "Linked 1 pull request":
      return gt("Linked 1 pull request");
    case "Unlinked 1 pull request":
      return gt("Unlinked 1 pull request");
    case "Watching 1 pull request":
      return gt("Watching 1 pull request");
    case "Stopped watching 1 pull request":
      return gt("Stopped watching 1 pull request");
    case "Checked linked pull requests":
      return gt("Checked linked pull requests");
    case "Command":
      return gt("Command");
    case "Searched files":
      return gt("Searched files");
    case "Searched the web":
      return gt("Searched the web");
    case "Approval requested":
      return gt("Approval requested");
    case "Input requested":
      return gt("Input requested");
    case "Checkpoint captured":
      return gt("Checkpoint captured");
    case "Interrupt requested":
      return gt("Interrupt requested");
    case "Run interrupted":
      return gt("Run interrupted");
    case "Usage limit reached":
      return gt("Usage limit reached");
    case "Provider error":
      return gt("Provider error");
    case "Context handed off":
      return gt("Context handed off");
    case "Thread forked":
      return gt("Thread forked");
    case "Thread created":
      return gt("Thread created");
    case "Tool call":
      return gt("Tool call");
    case "Proposed plan":
      return gt("Proposed plan");
    case "Plan updated":
      return gt("Plan updated");
    case "User message":
      return gt("User message");
    case "Assistant message":
      return gt("Assistant message");
    case "Subagent":
      return gt("Subagent");

    // Provider status messages from the server.
    case "Codex is disabled in T3 Code settings.":
      return gt("Codex is disabled in T3 Code settings.");
    case "Codex provider status has not been checked in this session yet.":
      return gt("Codex provider status has not been checked in this session yet.");
    case "Codex CLI is not authenticated. Run `codex login` and try again.":
      return gt("Codex CLI is not authenticated. Run `codex login` and try again.");
    case "Timed out while checking Codex app-server provider status.":
      return gt("Timed out while checking Codex app-server provider status.");
    case "Codex did not return its model catalog in time.":
      return gt("Codex did not return its model catalog in time.");
    case "Set up Codex to get started.":
      return gt("Set up Codex to get started.");
    case "Signed in with ChatGPT, but token sharing is disabled. Sign in again and enable token sharing, or use another provider.":
      return gt(
        "Signed in with ChatGPT, but token sharing is disabled. Sign in again and enable token sharing, or use another provider.",
      );
    case "Sign in with ChatGPT to use Codex.":
      return gt("Sign in with ChatGPT to use Codex.");
    case "Could not check Codex right now. Retry, or reconnect in provider settings.":
      return gt("Could not check Codex right now. Retry, or reconnect in provider settings.");
    case "Claude is disabled in T3 Code settings.":
      return gt("Claude is disabled in T3 Code settings.");
    case "Claude provider status has not been checked in this session yet.":
      return gt("Claude provider status has not been checked in this session yet.");
    case "Claude Agent CLI (`claude`) was not found on PATH.":
      return gt("Claude Agent CLI (`claude`) was not found on PATH.");
    case "Failed to execute Claude Agent CLI health check.":
      return gt("Failed to execute Claude Agent CLI health check.");
    case "Claude Agent CLI is installed but failed to run. Timed out while running command.":
      return gt(
        "Claude Agent CLI is installed but failed to run. Timed out while running command.",
      );
    case "Claude Agent CLI is installed but failed to run.":
      return gt("Claude Agent CLI is installed but failed to run.");
    case "Claude Agent CLI failed while checking account status.":
      return gt("Claude Agent CLI failed while checking account status.");
    case "Could not verify Claude authentication status from initialization result.":
      return gt("Could not verify Claude authentication status from initialization result.");
    case "Claude Code is not authenticated. Run `claude auth login` and try again.":
      return gt("Claude Code is not authenticated. Run `claude auth login` and try again.");
    case "Sign in with Google to use Antigravity.":
      return gt("Sign in with Google to use Antigravity.");
    case "Antigravity is installed. Google account access is not checked yet.":
      return gt("Antigravity is installed. Google account access is not checked yet.");
    case "Google account":
      return gt("Google account");
    case "Gemini API key":
      return gt("Gemini API key");
    case "Checking Antigravity availability.":
      return gt("Checking Antigravity availability.");
    case "Antigravity is disabled in T3 Code settings.":
      return gt("Antigravity is disabled in T3 Code settings.");
    case "Antigravity could not complete its local health check.":
      return gt("Antigravity could not complete its local health check.");
    case "Antigravity ACP runtime is not installed or its executable could not be found.":
      return gt("Antigravity ACP runtime is not installed or its executable could not be found.");
    case "Provider refresh failed after update.":
      return gt("Provider refresh failed after update.");
    case "Reading secrets…":
      return gt("Reading secrets…");
    case "Cursor is disabled in T3 Code settings.":
      return gt("Cursor is disabled in T3 Code settings.");
    case "Checking Cursor SDK availability...":
      return gt("Checking Cursor SDK availability...");
    case "Sign in with Cursor or add CURSOR_API_KEY in provider settings.":
      return gt("Sign in with Cursor or add CURSOR_API_KEY in provider settings.");
    case "Cursor SDK catalog request failed. Check server logs for details.":
      return gt("Cursor SDK catalog request failed. Check server logs for details.");
    case "Cursor sign-in expired or was rejected. Sign in again in provider settings.":
      return gt("Cursor sign-in expired or was rejected. Sign in again in provider settings.");
    case "Cursor SDK authentication failed. Check CURSOR_API_KEY.":
      return gt("Cursor SDK authentication failed. Check CURSOR_API_KEY.");
    case "Cursor needs a paid plan to run in T3 Code. Upgrade this account or sign in with a different one.":
      return gt(
        "Cursor needs a paid plan to run in T3 Code. Upgrade this account or sign in with a different one.",
      );
    case "Cursor needs a paid plan to run in T3 Code. Upgrade the account that owns CURSOR_API_KEY or use a key from a paid account.":
      return gt(
        "Cursor needs a paid plan to run in T3 Code. Upgrade the account that owns CURSOR_API_KEY or use a key from a paid account.",
      );
    case "Cursor SDK model discovery returned no built-in models.":
      return gt("Cursor SDK model discovery returned no built-in models.");
    case "Grok is disabled in T3 Code settings.":
      return gt("Grok is disabled in T3 Code settings.");
    case "Checking Grok CLI availability...":
      return gt("Checking Grok CLI availability...");
    case "Grok CLI (`grok`) is not installed or not on PATH.":
      return gt("Grok CLI (`grok`) is not installed or not on PATH.");
    case "Failed to execute Grok CLI health check.":
      return gt("Failed to execute Grok CLI health check.");
    case "Grok CLI is installed but timed out while running `grok --version`.":
      return gt("Grok CLI is installed but timed out while running `grok --version`.");
    case "Grok CLI is installed but failed to run.":
      return gt("Grok CLI is installed but failed to run.");
    case "Grok CLI is installed but ACP initialize failed. Model options may be incomplete.":
      return gt(
        "Grok CLI is installed but ACP initialize failed. Model options may be incomplete.",
      );
    case "Grok CLI did not list any models. Model options may be incomplete.":
      return gt("Grok CLI did not list any models. Model options may be incomplete.");
    case "Grok CLI is installed but not logged in. Run `grok login`.":
      return gt("Grok CLI is installed but not logged in. Run `grok login`.");
    case "OpenCode server rejected authentication. Check the server URL and password.":
      return gt("OpenCode server rejected authentication. Check the server URL and password.");
    case "Failed to connect to the configured OpenCode server.":
      return gt("Failed to connect to the configured OpenCode server.");
    case "OpenCode CLI (`opencode`) is not installed or not on PATH.":
      return gt("OpenCode CLI (`opencode`) is not installed or not on PATH.");
    case "macOS is blocking the OpenCode binary (quarantine). Run `xattr -d com.apple.quarantine $(which opencode)` to fix this.":
      return gt(
        "macOS is blocking the OpenCode binary (quarantine). Run `xattr -d com.apple.quarantine $(which opencode)` to fix this.",
      );
    case "macOS killed the OpenCode process due to an invalid code signature. The binary may be corrupted. Try reinstalling OpenCode.":
      return gt(
        "macOS killed the OpenCode process due to an invalid code signature. The binary may be corrupted. Try reinstalling OpenCode.",
      );
    case "Failed to load OpenCode provider inventory.":
      return gt("Failed to load OpenCode provider inventory.");
    case "Failed to execute OpenCode CLI health check.":
      return gt("Failed to execute OpenCode CLI health check.");
    case "OpenCode is disabled in T3 Code settings. A server URL is configured.":
      return gt("OpenCode is disabled in T3 Code settings. A server URL is configured.");
    case "OpenCode is disabled in T3 Code settings.":
      return gt("OpenCode is disabled in T3 Code settings.");
    case "OpenCode provider status has not been checked in this session yet.":
      return gt("OpenCode provider status has not been checked in this session yet.");
    case "OpenCode could not load its model list.":
      return gt("OpenCode could not load its model list.");
    case "OpenCode 2 is running, but it did not list any models yet.":
      return gt("OpenCode 2 is running, but it did not list any models yet.");
    case "OpenCode upstream providers are connected, but it did not list any models yet.":
      return gt("OpenCode upstream providers are connected, but it did not list any models yet.");
    case "Connected to the configured OpenCode server, but it did not report any connected upstream providers.":
      return gt(
        "Connected to the configured OpenCode server, but it did not report any connected upstream providers.",
      );
    case "OpenCode is available, but it did not report any connected upstream providers.":
      return gt("OpenCode is available, but it did not report any connected upstream providers.");

    // Provider compatibility and updates.
    case "This provider version is known to be incompatible with this T3 Code release.":
      return gt("This provider version is known to be incompatible with this T3 Code release.");
    case "This provider version is outside the supported range for this T3 Code release.":
      return gt("This provider version is outside the supported range for this T3 Code release.");
    case "This provider version has limited compatibility with this T3 Code release.":
      return gt("This provider version has limited compatibility with this T3 Code release.");
    case "Waiting for another provider update to finish.":
      return gt("Waiting for another provider update to finish.");
    case "Checking for the latest version":
      return gt("Checking for the latest version");
    case "Waiting for running provider work to finish.":
      return gt("Waiting for running provider work to finish.");
    case "Verifying the installed version":
      return gt("Verifying the installed version");
    case "Provider installation changed. Refresh and try again.":
      return gt("Provider installation changed. Refresh and try again.");
    case "This version is no longer recommended or this installer cannot install a specific version. Refresh provider settings.":
      return gt(
        "This version is no longer recommended or this installer cannot install a specific version. Refresh provider settings.",
      );
    case "The latest provider version is incompatible with this T3 Code release. Review provider settings.":
      return gt(
        "The latest provider version is incompatible with this T3 Code release. Review provider settings.",
      );
    case "OpenCode CLI updated. Restart the configured local OpenCode server to use the new version.":
      return gt(
        "OpenCode CLI updated. Restart the configured local OpenCode server to use the new version.",
      );
    case "Already up to date.":
      return gt("Already up to date.");
    case "Update command completed, but T3 Code could not verify the provider version.":
      return gt("Update command completed, but T3 Code could not verify the provider version.");
    case "Update command completed, but T3 Code still detects an outdated provider version.":
      return gt(
        "Update command completed, but T3 Code still detects an outdated provider version.",
      );
    case "Provider updated.":
      return gt("Provider updated.");
    case "Update command failed.":
      return gt("Update command failed.");
    case "Update command failed to run.":
      return gt("Update command failed to run.");
    case "Update stopped before it finished.":
      return gt("Update stopped before it finished.");

    // Provider sign-in.
    case "Starting sign-in.":
      return gt("Starting sign-in.");
    case "Complete sign-in to continue.":
      return gt("Complete sign-in to continue.");
    case "Checking provider sign-in.":
      return gt("Checking provider sign-in.");
    case "Sign-in failed. Start again.":
      return gt("Sign-in failed. Start again.");
    case "Sign-in cancelled.":
      return gt("Sign-in cancelled.");
    case "Sign-in is in progress in another client.":
      return gt("Sign-in is in progress in another client.");
    case "Could not sign out. Try again.":
      return gt("Could not sign out. Try again.");
    case "This provider's shared sign-in changed.":
      return gt("This provider's shared sign-in changed.");
    case "Could not reach ChatGPT sign-in. Try again.":
      return gt("Could not reach ChatGPT sign-in. Try again.");
    case "ChatGPT sign-in is temporarily unavailable. Try again.":
      return gt("ChatGPT sign-in is temporarily unavailable. Try again.");
    case "ChatGPT did not accept this sign-in. Try again.":
      return gt("ChatGPT did not accept this sign-in. Try again.");
    case "Your ChatGPT connection expired or was disconnected. Sign in again.":
      return gt("Your ChatGPT connection expired or was disconnected. Sign in again.");
    case "This sign-in code expired. Start again.":
      return gt("This sign-in code expired. Start again.");
    case "ChatGPT sign-in was declined. Sign in again when you are ready.":
      return gt("ChatGPT sign-in was declined. Sign in again when you are ready.");
    case "ChatGPT could not complete sign-in. Try again.":
      return gt("ChatGPT could not complete sign-in. Try again.");
    case "ChatGPT sign-in could not be completed.":
      return gt("ChatGPT sign-in could not be completed.");
    case "ChatGPT sign-in could not be verified. Start again.":
      return gt("ChatGPT sign-in could not be verified. Start again.");
    case "ChatGPT sign-in could not be completed. Start again.":
      return gt("ChatGPT sign-in could not be completed. Start again.");
    case "Token sharing was not enabled for the new account. Your existing ChatGPT connection is unchanged.":
      return gt(
        "Token sharing was not enabled for the new account. Your existing ChatGPT connection is unchanged.",
      );
    case "Sign in with ChatGPT to use managed Codex.":
      return gt("Sign in with ChatGPT to use managed Codex.");
    case "Token sharing is disabled. Sign in with ChatGPT and enable token sharing.":
      return gt("Token sharing is disabled. Sign in with ChatGPT and enable token sharing.");
    case "Your ChatGPT connection expired. Sign in again.":
      return gt("Your ChatGPT connection expired. Sign in again.");
    case "Could not renew the ChatGPT connection. Retry, or sign in again.":
      return gt("Could not renew the ChatGPT connection. Retry, or sign in again.");
    case "ChatGPT token sharing is no longer enabled. Sign in again.":
      return gt("ChatGPT token sharing is no longer enabled. Sign in again.");
    case "Open the Cursor sign-in page and finish signing in. This page updates automatically.":
      return gt(
        "Open the Cursor sign-in page and finish signing in. This page updates automatically.",
      );
    case "Checking Cursor sign-in.":
      return gt("Checking Cursor sign-in.");
    case "Starting Cursor sign-in.":
      return gt("Starting Cursor sign-in.");
    case "Cursor sign-in was cancelled.":
      return gt("Cursor sign-in was cancelled.");
    case "Cursor sign-in failed or expired. Start sign-in again.":
      return gt("Cursor sign-in failed or expired. Start sign-in again.");
    case "Cursor sign-out failed. Try again.":
      return gt("Cursor sign-out failed. Try again.");
    case "Cursor sign-in failed or timed out. Check that this machine can reach Cursor, then start sign-in again.":
      return gt(
        "Cursor sign-in failed or timed out. Check that this machine can reach Cursor, then start sign-in again.",
      );
    case "Cursor sign-in failed. Start sign-in again.":
      return gt("Cursor sign-in failed. Start sign-in again.");
    case "Starting Google sign-in.":
      return gt("Starting Google sign-in.");
    case "Checking credentials.":
      return gt("Checking credentials.");
    case "Open the Google sign-in link. If you are remote, paste the redirect URL here.":
      return gt("Open the Google sign-in link. If you are remote, paste the redirect URL here.");
    case "Checking Antigravity access and models.":
      return gt("Checking Antigravity access and models.");
    case "Waiting for Google to finish sign-in.":
      return gt("Waiting for Google to finish sign-in.");
    case "Google sign-in failed. Start sign-in again.":
      return gt("Google sign-in failed. Start sign-in again.");
    case "Google sign-in expired. Start sign-in again.":
      return gt("Google sign-in expired. Start sign-in again.");
    case "Google sign-in was cancelled.":
      return gt("Google sign-in was cancelled.");
    case "This provider does not support sign-in in T3 Code.":
      return gt("This provider does not support sign-in in T3 Code.");
    case "This provider instance is no longer available.":
      return gt("This provider instance is no longer available.");
    case "Could not read the provider's active sessions. Try again.":
      return gt("Could not read the provider's active sessions. Try again.");
    case "Could not stop all sessions for this provider. Try again.":
      return gt("Could not stop all sessions for this provider. Try again.");
    case "Another provider instance is changing this shared sign-in. Finish or cancel it first.":
      return gt(
        "Another provider instance is changing this shared sign-in. Finish or cancel it first.",
      );
    case "This provider does not accept this sign-in interaction.":
      return gt("This provider does not accept this sign-in interaction.");
  }
  return undefined;
}
