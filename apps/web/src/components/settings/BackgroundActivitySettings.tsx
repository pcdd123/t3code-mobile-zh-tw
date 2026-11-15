import { useScopedSettingsWriteAllowed } from "./useScopedSettings";
import { useGT, useMessages } from "gt-react";
import { SettingsIcon } from "lucide-react";
import { useState } from "react";
import { type BackgroundActivityProfile } from "@t3tools/contracts";
import { DEFAULT_UNIFIED_SETTINGS } from "@t3tools/contracts/settings";
import { resolveServerBackgroundActivitySettings } from "@t3tools/shared/backgroundActivitySettings";
import * as Duration from "effect/Duration";
import * as Equal from "effect/Equal";
import {
  useScopedSettings,
  useScopedSettingsMixed,
  useUpdateScopedSettings,
} from "./useScopedSettings";
import { useSettingsScope } from "./SettingsScopeContext";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "../ui/dialog";
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { Tooltip, TooltipPopup, TooltipTrigger } from "../ui/tooltip";
import {
  backgroundActivityOverrideSettings,
  backgroundActivitySharedPolicySettings,
  durationToSeconds,
  PROVIDER_HEALTH_INTERVAL_STEP_SECONDS,
  resolveBackgroundActivityProfileOption,
} from "./SettingsPanels.logic";
import { IntervalSecondsField } from "./IntervalSecondsField";
import { PolicyTooltip, SettingResetButton, SettingsRow } from "./settingsLayout";
import { searchableSetting } from "./settingsSearch";

type Translate = ReturnType<typeof useGT>;

function profileLabel(profile: BackgroundActivityProfile, gt: Translate): string {
  switch (profile) {
    case "balanced":
      return gt("Balanced");
    case "performance":
      return gt("Performance");
    case "battery-saver":
      return gt("Battery saver");
  }
}

type BackgroundActivityProfileOption = BackgroundActivityProfile | "advanced";

function profileOptionLabel(option: BackgroundActivityProfileOption, gt: Translate): string {
  return option === "advanced" ? gt("Advanced") : profileLabel(option, gt);
}

function profileDescription(profile: BackgroundActivityProfile, gt: Translate): string {
  switch (profile) {
    case "balanced":
      return gt("Pauses probes for idle clients, locked hosts, or low power mode.");
    case "performance":
      return gt("Allows scoped background probes while any subscribed client remains connected.");
    case "battery-saver":
      return gt("Also pauses background probes when the host or client is on battery.");
  }
}

type BackgroundActivityBooleanOverride =
  | "pauseWhenHostLocked"
  | "pauseWhenHostLowPower"
  | "pauseWhenClientLowPower"
  | "pauseWhenOnBattery";

const BACKGROUND_ACTIVITY_BOOLEAN_OVERRIDES: ReadonlyArray<BackgroundActivityBooleanOverride> = [
  "pauseWhenHostLocked",
  "pauseWhenHostLowPower",
  "pauseWhenClientLowPower",
  "pauseWhenOnBattery",
];

function booleanOverrideLabel(key: BackgroundActivityBooleanOverride, gt: Translate): string {
  switch (key) {
    case "pauseWhenHostLocked":
      return gt("Pause when host is locked");
    case "pauseWhenHostLowPower":
      return gt("Pause on host low power");
    case "pauseWhenClientLowPower":
      return gt("Pause on client low power");
    case "pauseWhenOnBattery":
      return gt("Pause on battery");
  }
}

function resetBackgroundActivitySettings() {
  return {
    backgroundActivity: DEFAULT_UNIFIED_SETTINGS.backgroundActivity,
  };
}

function backgroundActivityProfileSettings(profile: BackgroundActivityProfile) {
  return {
    backgroundActivity: {
      schemaVersion: 1 as const,
      profile,
      overrides: {},
    },
  };
}

function BackgroundActivityAdvancedDialog({
  open,
  onOpenChange,
}: {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}) {
  const gt = useGT();
  const m = useMessages();
  const canWriteSettings = useScopedSettingsWriteAllowed();
  const settings = useScopedSettings();
  const updateSettings = useUpdateScopedSettings();
  const resolvedBackgroundActivity = resolveServerBackgroundActivitySettings(settings);
  const activeProfile = resolvedBackgroundActivity.profile;
  const automaticGitFetchIntervalSeconds = durationToSeconds(
    resolvedBackgroundActivity.automaticGitFetchInterval,
  );
  const providerHealthRefreshIntervalSeconds = durationToSeconds(
    resolvedBackgroundActivity.providerHealthRefreshInterval,
  );
  const hostPowerMonitorActiveIntervalSeconds = durationToSeconds(
    resolvedBackgroundActivity.hostPowerMonitorActiveInterval,
  );
  const hostPowerMonitorIdleIntervalSeconds = durationToSeconds(
    resolvedBackgroundActivity.hostPowerMonitorIdleInterval,
  );

  return (
    <Dialog open={open && canWriteSettings} onOpenChange={onOpenChange}>
      <DialogPopup className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{gt("Background Activity")}</DialogTitle>
          <DialogDescription>
            {gt("Tune the shared power policy and the background intervals that feed it.")}
          </DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <fieldset
            disabled={!canWriteSettings}
            className="min-w-0 overflow-hidden rounded-xl border bg-card text-card-foreground"
          >
            <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="text-sm font-medium">{gt("Shared policy")}</div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {gt(
                    "Controls whether background work may run after a subscribed interval fires.",
                  )}
                </p>
              </div>
              <Select
                value={activeProfile}
                onValueChange={(value) => {
                  if (
                    value === "balanced" ||
                    value === "performance" ||
                    value === "battery-saver"
                  ) {
                    updateSettings({
                      backgroundActivity: backgroundActivitySharedPolicySettings(settings, value),
                    });
                  }
                }}
              >
                <SelectTrigger
                  size="sm"
                  className="w-full sm:w-40"
                  aria-label={gt("Shared background policy")}
                >
                  <SelectValue>{profileLabel(activeProfile, gt)}</SelectValue>
                </SelectTrigger>
                <SelectPopup align="end" alignItemWithTrigger={false}>
                  <SelectItem hideIndicator value="balanced">
                    {profileLabel("balanced", gt)}
                  </SelectItem>
                  <SelectItem hideIndicator value="performance">
                    {profileLabel("performance", gt)}
                  </SelectItem>
                  <SelectItem hideIndicator value="battery-saver">
                    {profileLabel("battery-saver", gt)}
                  </SelectItem>
                </SelectPopup>
              </Select>
            </div>

            <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="text-sm font-medium">
                  {m(searchableSetting("git-fetch-interval").title)}
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {gt("Refresh remote branch status in the background.")}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <IntervalSecondsField
                  label={gt("Git fetch interval")}
                  value={automaticGitFetchIntervalSeconds}
                  min={0}
                  step={5}
                  onCommit={(seconds, options) =>
                    updateSettings(
                      backgroundActivityOverrideSettings(
                        settings.backgroundActivity,
                        resolvedBackgroundActivity,
                        { automaticGitFetchInterval: Duration.seconds(seconds) },
                      ),
                      options,
                    )
                  }
                />
                <span className="text-xs text-muted-foreground">{gt("seconds")}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="text-sm font-medium">{gt("Provider health interval")}</div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {gt(
                    "Refresh provider availability, versions, and auth state. Model catalog updates follow Provider update checks.",
                  )}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <IntervalSecondsField
                  label={gt("provider health interval")}
                  value={providerHealthRefreshIntervalSeconds}
                  min={0}
                  step={PROVIDER_HEALTH_INTERVAL_STEP_SECONDS}
                  onCommit={(seconds, options) =>
                    updateSettings(
                      backgroundActivityOverrideSettings(
                        settings.backgroundActivity,
                        resolvedBackgroundActivity,
                        { providerHealthRefreshInterval: Duration.seconds(seconds) },
                      ),
                      options,
                    )
                  }
                />
                <span className="text-xs text-muted-foreground">{gt("seconds")}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="text-sm font-medium">{gt("Host power monitor")}</div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {gt("Poll host power state while clients are active.")}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <IntervalSecondsField
                  label={gt("active host power interval")}
                  value={hostPowerMonitorActiveIntervalSeconds}
                  min={5}
                  step={5}
                  onCommit={(seconds, options) =>
                    updateSettings(
                      backgroundActivityOverrideSettings(
                        settings.backgroundActivity,
                        resolvedBackgroundActivity,
                        { hostPowerMonitorActiveInterval: Duration.seconds(seconds) },
                      ),
                      options,
                    )
                  }
                />
                <span className="text-xs text-muted-foreground">{gt("seconds")}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="text-sm font-medium">{gt("Idle host monitor")}</div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {gt("Poll host power state when no foreground client is active.")}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <IntervalSecondsField
                  label={gt("idle host power interval")}
                  value={hostPowerMonitorIdleIntervalSeconds}
                  min={5}
                  step={30}
                  onCommit={(seconds, options) =>
                    updateSettings(
                      backgroundActivityOverrideSettings(
                        settings.backgroundActivity,
                        resolvedBackgroundActivity,
                        { hostPowerMonitorIdleInterval: Duration.seconds(seconds) },
                      ),
                      options,
                    )
                  }
                />
                <span className="text-xs text-muted-foreground">{gt("seconds")}</span>
              </div>
            </div>

            <div className="grid gap-0 border-t sm:grid-cols-2">
              {BACKGROUND_ACTIVITY_BOOLEAN_OVERRIDES.map((key) => (
                <label
                  key={key}
                  className="flex items-center justify-between gap-3 border-b px-4 py-3 last:border-b-0 sm:border-r sm:even:border-r-0"
                >
                  <span className="text-sm font-medium">{booleanOverrideLabel(key, gt)}</span>
                  <Switch
                    checked={resolvedBackgroundActivity[key]}
                    onCheckedChange={(checked) =>
                      updateSettings(
                        backgroundActivityOverrideSettings(
                          settings.backgroundActivity,
                          resolvedBackgroundActivity,
                          {
                            [key]: Boolean(checked),
                          },
                        ),
                      )
                    }
                    aria-label={booleanOverrideLabel(key, gt)}
                  />
                </label>
              ))}
            </div>
          </fieldset>
        </DialogPanel>
        <DialogFooter>
          <Button
            variant="outline"
            disabled={!canWriteSettings}
            onClick={() => updateSettings(resetBackgroundActivitySettings())}
          >
            {gt("Reset all")}
          </Button>
          <Button onClick={() => onOpenChange(false)}>{gt("Done")}</Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}

export function BackgroundActivitySettingsRow() {
  const gt = useGT();
  const m = useMessages();
  const settings = useScopedSettings();
  const updateSettings = useUpdateScopedSettings();
  const { scope, environment } = useSettingsScope();
  const environmentId = environment?.environmentId ?? null;
  const isEnvironmentScope = scope.environmentIds.length === 1 && environmentId !== null;
  const [backgroundActivityDialogOpen, setBackgroundActivityDialogOpen] = useState(false);
  const mixedBackgroundActivity = useScopedSettingsMixed(["backgroundActivity"]);
  const resolvedBackgroundActivity = resolveServerBackgroundActivitySettings(settings);
  const activeBackgroundActivityProfile = resolvedBackgroundActivity.profile;
  const backgroundActivityProfileOption = resolveBackgroundActivityProfileOption(settings);
  const backgroundActivityDescription =
    backgroundActivityProfileOption === "advanced"
      ? gt("Uses custom intervals. Shared policy: {policy}.", {
          policy: profileLabel(activeBackgroundActivityProfile, gt),
        })
      : profileDescription(resolvedBackgroundActivity.profile, gt);
  const canResetBackgroundActivity = !Equal.equals(
    settings.backgroundActivity,
    DEFAULT_UNIFIED_SETTINGS.backgroundActivity,
  );

  return (
    <SettingsRow
      serverScoped
      settingKeys={["backgroundActivity"]}
      id={searchableSetting("background-activity").id}
      title={
        <span className="inline-flex items-center gap-1.5">
          {m(searchableSetting("background-activity").title)}
          <PolicyTooltip>
            {gt(
              "This shared policy gates background work such as Git refreshes and provider health probes after their individual intervals elapse.",
            )}
          </PolicyTooltip>
        </span>
      }
      description={backgroundActivityDescription}
      resetAction={
        canResetBackgroundActivity ? (
          <SettingResetButton
            label={gt("background activity")}
            onClick={() => updateSettings(resetBackgroundActivitySettings())}
          />
        ) : null
      }
      control={
        <>
          <Select
            value={mixedBackgroundActivity ? null : backgroundActivityProfileOption}
            onValueChange={(value) => {
              if (value === "advanced") {
                if (isEnvironmentScope) setBackgroundActivityDialogOpen(true);
                return;
              }
              if (value === "balanced" || value === "performance" || value === "battery-saver") {
                updateSettings(backgroundActivityProfileSettings(value));
              }
            }}
          >
            <SelectTrigger
              size="sm"
              className="w-full sm:w-40"
              aria-label={gt("Background activity profile")}
            >
              <SelectValue>
                {(value: BackgroundActivityProfileOption | null) =>
                  value === null ? gt("Mixed") : profileOptionLabel(value, gt)
                }
              </SelectValue>
            </SelectTrigger>
            <SelectPopup align="end" alignItemWithTrigger={false}>
              <SelectItem hideIndicator value="balanced">
                {profileLabel("balanced", gt)}
              </SelectItem>
              <SelectItem hideIndicator value="performance">
                {profileLabel("performance", gt)}
              </SelectItem>
              <SelectItem hideIndicator value="battery-saver">
                {profileLabel("battery-saver", gt)}
              </SelectItem>
              <SelectItem hideIndicator value="advanced" disabled={!isEnvironmentScope}>
                {isEnvironmentScope ? gt("Advanced") : gt("Advanced (one environment)")}
              </SelectItem>
            </SelectPopup>
          </Select>
          {backgroundActivityProfileOption === "advanced" && isEnvironmentScope ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    size="icon-sm"
                    variant="outline"
                    aria-label={gt("Configure advanced background activity")}
                    onClick={() => setBackgroundActivityDialogOpen(true)}
                  >
                    <SettingsIcon className="size-4" />
                  </Button>
                }
              />
              <TooltipPopup side="top">{gt("Configure background activity")}</TooltipPopup>
            </Tooltip>
          ) : null}
          <BackgroundActivityAdvancedDialog
            open={backgroundActivityDialogOpen && isEnvironmentScope}
            onOpenChange={setBackgroundActivityDialogOpen}
          />
        </>
      }
    />
  );
}
