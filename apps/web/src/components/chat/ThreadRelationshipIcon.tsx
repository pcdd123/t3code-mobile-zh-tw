import type { ProviderDriverKind, ServerProvider } from "@t3tools/contracts";
import { BotIcon, type LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { shouldShowInstanceBadge, type ProviderInstanceEntry } from "../../providerInstances";
import { ProviderInstanceIcon } from "./ProviderInstanceIcon";
import type { useGT } from "gt-react";

export function threadRelationshipStatusLabel(
  gt: ReturnType<typeof useGT>,
  status: string | null,
): string {
  switch (status) {
    case "preparing":
    case "starting":
      return gt("Starting");
    case "running":
    case "in_progress":
      return gt("Running");
    case "pending":
    case "queued":
      return gt("Queued");
    case "waiting":
    case "blocked":
      return gt("Waiting");
    case "completed":
      return gt("Done");
    case "failed":
    case "error":
      return gt("Failed");
    case "cancelled":
    case "interrupted":
      return gt("Stopped");
    case "rolled_back":
      return gt("Reverted");
    case "resolved_native":
      return gt("Resolved (native)");
    case "resolved_portable":
      return gt("Resolved (portable)");
    case "consumed":
      return gt("Consumed");
    case "superseded":
      return gt("Superseded");
    case "idle":
      return gt("Idle");
    default:
      return gt("Unknown");
  }
}

export function ThreadRelationshipIcon({
  driver,
  provider,
  providerEntries = [],
  status,
  fallbackIcon: FallbackIcon = BotIcon,
}: {
  driver?: ProviderDriverKind | undefined;
  provider?: ServerProvider | undefined;
  providerEntries?: ReadonlyArray<ProviderInstanceEntry>;
  status: string | null;
  fallbackIcon?: LucideIcon;
}) {
  const iconClassName = "size-4 shrink-0 text-muted-foreground";
  const entry = driver
    ? providerEntries.find((candidate) => candidate.instanceId === provider?.instanceId)
    : undefined;
  const showInstanceBadge = entry !== undefined && shouldShowInstanceBadge(entry, providerEntries);
  return (
    <span className="relative inline-flex size-4 shrink-0 items-center justify-center">
      {driver ? (
        <ProviderInstanceIcon
          driverKind={driver}
          displayName={entry?.displayName ?? provider?.displayName ?? driver}
          accentColor={entry?.accentColor}
          acpRegistryAgentId={entry?.acpRegistryAgentId}
          acpRegistryIconUrl={entry?.acpRegistryIconUrl ?? provider?.iconUrl}
          showBadge={showInstanceBadge}
          size="compact"
          iconClassName={iconClassName}
          className="z-auto"
        />
      ) : (
        <FallbackIcon className={iconClassName} />
      )}
      <span
        className={cn(
          "absolute size-2 rounded-full border-2 border-card",
          showInstanceBadge ? "-left-1 -top-1" : "-bottom-1 -right-1",
          status === "running" ||
            status === "in_progress" ||
            status === "pending" ||
            status === "waiting"
            ? "bg-info"
            : status === "failed" || status === "error"
              ? "bg-destructive"
              : status === "completed"
                ? "bg-success"
                : "bg-muted-foreground/45",
        )}
        aria-hidden="true"
      />
    </span>
  );
}
