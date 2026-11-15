import { useGT } from "gt-react";

import { MenuGroupLabel } from "../ui/menu";
import { Tooltip, TooltipPopup, TooltipTrigger } from "../ui/tooltip";
import { translatePullRequestStackNotice } from "./pullRequestStackSnapshot";

export function PullRequestStackHeader({
  number,
  notice,
  stale = false,
}: {
  number: number;
  notice?: string | null | undefined;
  stale?: boolean;
}) {
  const gt = useGT();
  return (
    <MenuGroupLabel>
      <div className="flex items-center justify-between gap-2">
        <span>{gt("Stack #{number}", { number })}</span>
        {notice ? (
          <Tooltip>
            <TooltipTrigger render={<span role="status" className="text-xs font-normal" />}>
              {stale ? gt("May be stale") : gt("Refreshing…")}
            </TooltipTrigger>
            <TooltipPopup>{translatePullRequestStackNotice(notice, gt)}</TooltipPopup>
          </Tooltip>
        ) : null}
      </div>
    </MenuGroupLabel>
  );
}
