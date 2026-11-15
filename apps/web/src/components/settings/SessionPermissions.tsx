import { type EnvironmentId, sessionGrantsScope } from "@t3tools/contracts";
import {
  AUTH_SCOPE_OPTIONS,
  sessionPermissionsUnavailableMessage,
} from "@t3tools/shared/authScopeOptions";
import { useGT } from "gt-react";
import { useEnvironmentSessionState } from "~/state/session";

function scopeTitleLabel(gt: ReturnType<typeof useGT>, title: string): string {
  switch (title) {
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
    default:
      return title;
  }
}

function unavailableMessageLabel(gt: ReturnType<typeof useGT>, message: string): string {
  switch (message) {
    case "Connect to this environment to view this session’s permissions.":
      return gt("Connect to this environment to view this session’s permissions.");
    case "This environment did not accept your session. Reconnect to try again.":
      return gt("This environment did not accept your session. Reconnect to try again.");
    case "Could not verify your permissions. Retrying automatically.":
      return gt("Could not verify your permissions. Retrying automatically.");
    case "Checking permissions…":
      return gt("Checking permissions…");
    default:
      return message;
  }
}

export function SessionPermissions({
  environmentId,
  connected,
  routeContext = false,
}: {
  readonly environmentId: EnvironmentId;
  readonly connected: boolean;
  readonly routeContext?: boolean;
}) {
  const gt = useGT();
  const session = useEnvironmentSessionState(environmentId);
  return connected && !session.hasError && !session.isPending && session.data?.authenticated ? (
    <div className="space-y-3 py-3 text-xs">
      <p className="text-muted-foreground">
        {routeContext
          ? gt(
              "These permissions apply to your active route. Other routes may have different permissions.",
            )
          : gt("These permissions apply to this client’s current connection.")}
      </p>
      <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {AUTH_SCOPE_OPTIONS.map(({ scope, title }) => (
          <li key={scope} className="flex items-start justify-between gap-3">
            <span>{scopeTitleLabel(gt, title)}</span>
            <span className="shrink-0 text-muted-foreground">
              {sessionGrantsScope(session.data!, scope) ? gt("Allowed") : gt("Not granted")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  ) : (
    <p className="py-3 text-xs text-muted-foreground">
      {unavailableMessageLabel(
        gt,
        sessionPermissionsUnavailableMessage({
          connected,
          failed: session.hasError,
          rejected:
            !session.hasError && !session.isPending && session.data?.authenticated === false,
        }),
      )}
    </p>
  );
}
