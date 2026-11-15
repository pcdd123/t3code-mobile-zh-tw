import type { DevicePlatformAvailability } from "@t3tools/contracts";
import { useGT } from "gt-react";
import { Check, Minus } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipPopup } from "../ui/tooltip";

export function DeviceHostAvailability({
  platforms,
}: {
  platforms: ReadonlyArray<DevicePlatformAvailability>;
}) {
  const gt = useGT();
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {platforms.map((platform) => (
        <Tooltip key={platform.platform}>
          <TooltipTrigger render={<span tabIndex={0} className="inline-flex items-center gap-1" />}>
            {platform.available ? <Check className="size-3" /> : <Minus className="size-3" />}
            {platform.platform === "ios"
              ? platform.available
                ? gt("iOS available")
                : gt("iOS unavailable")
              : platform.available
                ? gt("Android available")
                : gt("Android unavailable")}
          </TooltipTrigger>
          <TooltipPopup>
            {platform.reason ??
              (platform.platform === "ios" ? gt("iOS available") : gt("Android available"))}
          </TooltipPopup>
        </Tooltip>
      ))}
    </div>
  );
}
