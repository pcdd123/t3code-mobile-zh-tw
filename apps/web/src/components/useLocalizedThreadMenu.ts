import { useGT } from "gt-react";
import type { ContextMenuItem } from "@t3tools/contracts";

/** Localize fixed menu actions while leaving user-provided names and snooze times intact. */
export function useLocalizedThreadMenu() {
  const gt = useGT();
  return <T extends string>(
    items: ReadonlyArray<ContextMenuItem<T>>,
  ): ReadonlyArray<ContextMenuItem<T>> => {
    const localize = (item: ContextMenuItem<T>): ContextMenuItem<T> => {
      let label = item.label;
      switch (item.id) {
        case "find":
          label = gt("Find in thread");
          break;
        case "new-thread-on-branch":
          label = gt("New thread on {branch}", {
            branch: item.label.slice("New thread on ".length),
          });
          break;
        case "filter-by-project":
          label =
            item.label === "Show all projects"
              ? gt("Show all projects")
              : gt("Filter by {project}", { project: item.label.slice("Filter by ".length) });
          break;
        case "pin":
          label = gt("Pin thread");
          break;
        case "unpin":
          label = gt("Unpin thread");
          break;
        case "settle":
          label = gt("Settle thread");
          break;
        case "unsettle":
          label = gt("Un-settle thread");
          break;
        case "unsnooze":
          label = gt("Wake thread");
          break;
        case "snooze":
          label = gt("Snooze");
          break;
        case "snooze:custom":
          label = gt("Custom…");
          break;
        case "rename":
          label = gt("Rename thread");
          break;
        case "regenerate-title":
          label = item.label === "Regenerating…" ? gt("Regenerating…") : gt("Regenerate title");
          break;
        case "mark-unread":
          label = gt("Mark unread");
          break;
        case "share-guest":
          label = gt("Share with guest");
          break;
        case "turn-into-project":
          label = gt("Turn into project");
          break;
        case "auto-settle":
          label = gt("Auto-settle behavior");
          break;
        case "auto-settle:enabled":
          label = gt("Follow settings");
          break;
        case "auto-settle:disabled":
          label = gt("Never");
          break;
        case "copy":
          label = gt("Copy");
          break;
        case "copy-path":
          label = gt("Path");
          break;
        case "copy-branch":
          label = gt("Branch");
          break;
        case "copy-thread":
          label = gt("Thread");
          break;
        case "copy-thread-id":
          label = gt("Thread ID");
          break;
        case "project-settings":
          label = gt("Project settings");
          break;
        case "archive":
          label = gt("Archive thread");
          break;
        case "delete":
          label = gt("Delete");
          break;
        case "discard":
          label = gt("Discard draft");
          break;
      }
      return {
        ...item,
        label,
        ...(item.children ? { children: item.children.map(localize) } : {}),
      };
    };
    return items.map(localize);
  };
}
