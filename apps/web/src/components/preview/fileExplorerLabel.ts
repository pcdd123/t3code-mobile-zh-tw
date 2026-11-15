import type { ExecutionEnvironmentPlatformOs, FileManagerRevealKind } from "@t3tools/contracts";
import type { useGT } from "gt-react";

export function revealInFileExplorerLabel(platform: string): string {
  const normalized = platform.toLowerCase();
  if (normalized.includes("mac")) return "Reveal in Finder";
  if (normalized.includes("win")) return "Reveal in File Explorer";
  return "Reveal in Files";
}

export function revealInFileExplorerLabelForOs(os: ExecutionEnvironmentPlatformOs): string {
  if (os === "darwin") return "Reveal in Finder";
  if (os === "windows") return "Reveal in File Explorer";
  return "Reveal in Files";
}

export function revealInFileExplorerLabelForKind(kind: FileManagerRevealKind): string {
  if (kind === "finder") return "Reveal in Finder";
  if (kind === "file-explorer") return "Reveal in File Explorer";
  return "Reveal in Files";
}

/** The labels above stay English ids for callers that compare them; this renders one for display. */
export function localizedRevealLabel(label: string, gt: ReturnType<typeof useGT>): string {
  switch (label) {
    case "Reveal in Finder":
      return gt("Reveal in Finder");
    case "Reveal in File Explorer":
      return gt("Reveal in File Explorer");
    case "Reveal in Files":
      return gt("Reveal in Files");
    default:
      return label;
  }
}
