import type { PullRequestInvolvement, PullRequestListState } from "@t3tools/contracts";
import type { useGT } from "gt-react";
import {
  CalendarArrowDownIcon,
  CalendarArrowUpIcon,
  ClockIcon,
  EyeIcon,
  LayersIcon,
  ListChecksIcon,
  Maximize2Icon,
  Minimize2Icon,
  PenLineIcon,
  UserLockIcon,
} from "lucide-react";

import type { PullRequestFilterOption } from "./PullRequestListFilters";
import type { PullRequestListSort } from "./pullRequestListPreferences";
import { PullRequestGlyph } from "./pullRequestIcons";

const INVOLVEMENT_TABS = [
  { value: "all", label: "All", Icon: LayersIcon },
  { value: "reviewing", label: "Reviewing", Icon: EyeIcon },
  { value: "authored", label: "Authored", Icon: PenLineIcon },
] as const satisfies ReadonlyArray<PullRequestFilterOption<PullRequestInvolvement>>;

const STATE_TABS = [
  { value: "all", label: "All", Icon: LayersIcon },
  { value: "open", label: "Open", Icon: PullRequestGlyph.pullRequest },
  { value: "closed", label: "Closed", Icon: PullRequestGlyph.closed },
  { value: "merged", label: "Merged", Icon: PullRequestGlyph.merged },
] as const satisfies ReadonlyArray<PullRequestFilterOption<PullRequestListState>>;

export const SORT_OPTIONS = [
  { value: "ready", label: "Merge readiness", Icon: ListChecksIcon },
  { value: "blocked", label: "Blocked on me", Icon: UserLockIcon },
  { value: "updated", label: "Recently updated", Icon: ClockIcon },
  { value: "newest", label: "Newest shown", Icon: CalendarArrowDownIcon },
  { value: "oldest", label: "Oldest shown", Icon: CalendarArrowUpIcon },
  { value: "largest", label: "Largest shown", Icon: Maximize2Icon },
  { value: "smallest", label: "Smallest shown", Icon: Minimize2Icon },
] as const satisfies ReadonlyArray<PullRequestFilterOption<PullRequestListSort>>;

type Translate = ReturnType<typeof useGT>;

export const involvementTabs = (gt: Translate) => {
  const labels: Record<PullRequestInvolvement, string> = {
    all: gt("All"),
    reviewing: gt("Reviewing"),
    authored: gt("Authored"),
  };
  return INVOLVEMENT_TABS.map((tab) => ({ ...tab, label: labels[tab.value] }));
};

export const stateTabs = (gt: Translate) => {
  const labels: Record<PullRequestListState, string> = {
    all: gt("All"),
    open: gt("Open"),
    closed: gt("Closed"),
    merged: gt("Merged"),
  };
  return STATE_TABS.map((tab) => ({ ...tab, label: labels[tab.value] }));
};

export const sortOptions = (gt: Translate) => {
  const labels: Record<PullRequestListSort, string> = {
    ready: gt("Merge readiness"),
    blocked: gt("Blocked on me"),
    updated: gt("Recently updated"),
    newest: gt("Newest shown"),
    oldest: gt("Oldest shown"),
    largest: gt("Largest shown"),
    smallest: gt("Smallest shown"),
  };
  return SORT_OPTIONS.map((option) => ({ ...option, label: labels[option.value] }));
};
