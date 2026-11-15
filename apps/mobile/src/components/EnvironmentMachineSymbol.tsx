import { useGT } from "gt-react-native";
import type { EnvironmentMachineKind } from "@t3tools/contracts";
import { SymbolView, type AppSymbolName } from "./ui/AppSymbol";

export const ENVIRONMENT_MACHINE_SYMBOLS = {
  server: "server.rack",
  cloud: "cloud",
  linux: "terminal",
  desktop: "desktopcomputer",
  laptop: "laptopcomputer",
  "mac-mini": "macmini",
  "mac-studio": "macstudio",
} as const satisfies Record<EnvironmentMachineKind, AppSymbolName>;

function machineKindLabel(kind: EnvironmentMachineKind, gt: ReturnType<typeof useGT>): string {
  switch (kind) {
    case "server":
      return gt("Server");
    case "cloud":
      return gt("Cloud VM");
    case "linux":
      return gt("Linux/WSL");
    case "desktop":
      return gt("Desktop");
    case "laptop":
      return gt("Laptop");
    case "mac-mini":
      return gt("Mini PC");
    case "mac-studio":
      return gt("Workstation");
  }
}

export function EnvironmentMachineSymbol(props: {
  readonly kind: EnvironmentMachineKind;
  readonly size: number;
  readonly tintColorClassName: string;
}) {
  const gt = useGT();
  return (
    <SymbolView
      accessibilityLabel={machineKindLabel(props.kind, gt)}
      name={ENVIRONMENT_MACHINE_SYMBOLS[props.kind]}
      size={props.size}
      tintColorClassName={props.tintColorClassName}
      type="monochrome"
    />
  );
}
