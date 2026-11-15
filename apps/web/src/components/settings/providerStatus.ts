import type {
  ServerProvider,
  ServerProviderVersionAdvisory,
  ServerProviderCompatibilityAdvisory,
} from "@t3tools/contracts";
import type { useGT } from "gt-react";

type Translate = ReturnType<typeof useGT>;

export const PROVIDER_STATUS_STYLES = {
  disabled: {
    dot: "bg-muted-foreground/50",
  },
  error: {
    dot: "bg-destructive",
  },
  neutral: {
    dot: "bg-muted-foreground",
  },
  ready: {
    dot: "bg-success",
  },
  warning: {
    dot: "bg-warning",
  },
} as const;

export type ProviderStatusKey = keyof typeof PROVIDER_STATUS_STYLES;

// Antigravity's local health check verifies installation, not Google sign-in.
// API-key and Agent Platform warnings still need attention.
function isAntigravitySignInUnchecked(provider: ServerProvider): boolean {
  return (
    provider.driver === "antigravity" &&
    provider.installed &&
    provider.status === "warning" &&
    provider.auth.status === "unknown" &&
    (provider.auth.type === undefined ||
      provider.auth.type === "oauth-personal" ||
      provider.auth.type === "oauth-business")
  );
}

export function getProviderStatusKey(provider: ServerProvider | undefined): ProviderStatusKey {
  if (provider && !provider.enabled) return "disabled";
  if (provider && isAntigravitySignInUnchecked(provider)) return "neutral";
  return provider?.status ?? "warning";
}

export function getProviderSummary(provider: ServerProvider | undefined, gt: Translate) {
  if (!provider) {
    return {
      headline: gt("Checking provider status"),
      detail: gt("Waiting for the server to report installation and authentication details."),
    };
  }
  if (!provider.enabled || provider.status === "disabled") {
    return {
      headline: gt("Disabled"),
      detail:
        provider.message ??
        gt("This provider is installed but disabled for new sessions in T3 Code."),
    };
  }
  if (!provider.installed) {
    return {
      headline: gt("Not found"),
      detail: provider.message ?? gt("CLI not detected on PATH."),
    };
  }
  if (provider.auth.status === "unauthenticated") {
    const authLabel = provider.auth.label ?? provider.auth.type;
    return {
      headline: authLabel
        ? gt("Not authenticated · {authLabel}", { authLabel })
        : gt("Not authenticated"),
      detail: provider.message ?? null,
    };
  }
  if (isAntigravitySignInUnchecked(provider)) {
    return {
      headline: gt("Installed · Sign-in not checked"),
      detail: provider.message ?? null,
    };
  }
  if (provider.status === "warning") {
    return {
      headline: gt("Needs attention"),
      detail:
        provider.message ??
        gt("The provider is installed, but the server could not fully verify it."),
    };
  }
  if (provider.status === "error") {
    return {
      headline: gt("Unavailable"),
      detail: provider.message ?? gt("The provider failed its startup checks."),
    };
  }
  if (provider.auth.status === "authenticated") {
    const authLabel = provider.auth.label ?? provider.auth.type;
    return {
      headline: authLabel ? gt("Authenticated · {authLabel}", { authLabel }) : gt("Authenticated"),
      detail: provider.message ?? null,
    };
  }
  return {
    headline: gt("Available"),
    detail: provider.message ?? null,
  };
}

export function getProviderVersionLabel(version: string | null | undefined) {
  if (!version) return null;
  const antigravity = /^agy_acp_server_(\d{4})(\d{2})(\d{2})_\d+(?:_(\w+))?$/.exec(version);
  if (antigravity) {
    const [, year, month, day, candidate] = antigravity;
    return `${year}-${month}-${day}${candidate ? ` ${candidate}` : ""}`;
  }
  return /^\d/.test(version) ? `v${version}` : version;
}

function compatibilityTitle(status: "graceful" | "unsupported" | "broken", gt: Translate) {
  switch (status) {
    case "graceful":
      return gt("Limited support");
    case "unsupported":
      return gt("Unsupported version");
    case "broken":
      return gt("Known broken version");
  }
}

export function getProviderVersionAdvisoryPresentation(
  advisory: ServerProviderVersionAdvisory | undefined,
  compatibility: ServerProviderCompatibilityAdvisory | undefined,
  showCompatibility: boolean,
  gt: Translate,
): {
  readonly title: string;
  readonly detail: string;
  readonly updateCommand: string | null;
  readonly emphasis: "normal" | "strong";
  readonly targetVersion: string | null;
} | null {
  const latestIsIncompatible =
    compatibility?.latestVersionStatus === "broken" ||
    compatibility?.latestVersionStatus === "unsupported";
  if (
    showCompatibility &&
    compatibility &&
    (compatibility.status === "graceful" ||
      compatibility.status === "unsupported" ||
      compatibility.status === "broken")
  ) {
    const targetVersion = compatibility.recommendedVersion;
    const recommendation = getProviderVersionLabel(targetVersion) ?? compatibility.recommendedRange;
    // Latest package versions cannot be updated into recommendations requiring another package.
    const isAlreadyLatest = advisory?.status === "current";
    return {
      title: compatibilityTitle(compatibility.status, gt),
      detail:
        compatibility.message ??
        (recommendation
          ? gt("Use {recommendation} for full support.", { recommendation })
          : gt("Update for full support.")),
      updateCommand:
        targetVersion || latestIsIncompatible || isAlreadyLatest
          ? null
          : (advisory?.updateCommand ?? null),
      emphasis: compatibility.status === "graceful" ? "normal" : "strong",
      targetVersion,
    };
  }
  if (
    !advisory ||
    advisory.status === "current" ||
    advisory.status === "unknown" ||
    latestIsIncompatible
  ) {
    return null;
  }

  const label = gt("Update available");
  const version = advisory.latestVersion;
  const versionLabel = getProviderVersionLabel(version);

  return {
    title: label,
    detail:
      advisory.message ??
      (versionLabel
        ? gt("Update available: install {version}.", { version: versionLabel })
        : gt("Update available: install the latest provider version.")),
    updateCommand: advisory.updateCommand,
    emphasis: "normal" as const,
    targetVersion: null,
  };
}
