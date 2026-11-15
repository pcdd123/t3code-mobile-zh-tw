import { useGT } from "gt-react";
import { useState } from "react";

import {
  desktopCliCommandStateAtom,
  getDesktopCliCommandBridge,
  refreshDesktopCliCommandState,
} from "~/state/desktopCliCommand";
import { useEnvironmentQuery } from "~/state/query";
import { Button } from "../ui/button";
import { stackedThreadToast, toastManager } from "../ui/toast";
import { SettingsRow } from "./settingsLayout";
import { searchableSetting } from "./settingsSearch";

type CliCommandAction = "install" | "uninstall" | "addToPath";

function failureTitle(action: CliCommandAction, gt: ReturnType<typeof useGT>): string {
  switch (action) {
    case "install":
      return gt("Could not install t3");
    case "uninstall":
      return gt("Could not remove t3");
    case "addToPath":
      return gt("Could not add t3 to PATH");
  }
}

/** The desktop `t3` command's state, and its actions with a toast on failure. */
export function useDesktopCliCommand() {
  const gt = useGT();
  const bridge = getDesktopCliCommandBridge();
  const query = useEnvironmentQuery(bridge ? desktopCliCommandStateAtom : null);
  const [pending, setPending] = useState(false);

  const run = (action: CliCommandAction) => {
    if (!bridge || pending) return;
    setPending(true);
    void bridge[action]()
      .then(refreshDesktopCliCommandState)
      .catch((error: unknown) => {
        toastManager.add(
          stackedThreadToast({
            type: "error",
            title: failureTitle(action, gt),
            description: error instanceof Error ? error.message : gt("Something went wrong."),
          }),
        );
      })
      .finally(() => setPending(false));
  };

  return {
    state: bridge ? query.data : undefined,
    busy: pending || query.isPending,
    run,
  };
}

export function CliCommandSettingsRow() {
  const gt = useGT();
  const { state, busy, run } = useDesktopCliCommand();

  if (!state?.supported) return null;
  const installed = state.installedPath !== null;
  const installedPath = state.installedPath ?? "";
  const description = state.shadowedBy
    ? gt("Another t3 at {path} runs first in a new terminal. Remove it to use T3 Code's.", {
        path: state.shadowedBy,
      })
    : !installed
      ? gt("Run T3 Code's CLI as `t3` from any terminal.")
      : state.onPath
        ? gt("Installed at {path}. Open a new terminal to use it.", { path: installedPath })
        : state.pathSetup?.added
          ? gt("Installed at {path} and added to PATH in {file}. Open a new terminal to use it.", {
              path: installedPath,
              file: state.pathSetup.file,
            })
          : state.pathSetup
            ? gt("Installed at {path}, which is not on your PATH yet.", { path: installedPath })
            : gt(
                "Installed at {path}, which is not on your PATH yet. Add its folder to your PATH to run `t3`.",
                { path: installedPath },
              );

  return (
    <SettingsRow
      {...searchableSetting("cli-command")}
      description={description}
      control={
        <div className="flex gap-2">
          {state.pathSetup && !state.pathSetup.added ? (
            <Button size="sm" variant="outline" disabled={busy} onClick={() => run("addToPath")}>
              {gt("Add to PATH")}
            </Button>
          ) : null}
          <Button
            size="sm"
            variant="outline"
            disabled={busy || (!installed && Boolean(state.shadowedBy))}
            onClick={() => run(installed ? "uninstall" : "install")}
          >
            {installed ? gt("Remove") : gt("Install")}
          </Button>
        </div>
      }
    />
  );
}
