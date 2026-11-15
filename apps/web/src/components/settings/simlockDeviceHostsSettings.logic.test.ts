import { describe, expect, it } from "vite-plus/test";

import { SecretProviderId, type EnvironmentId } from "@t3tools/contracts";

import {
  newSimlockDeviceHost,
  planSimlockDeviceHostSave,
  simlockDeviceHostProblem,
  updateSimlockDeviceHosts,
} from "./simlockDeviceHostsSettings.logic";

const gt = (message: string, values?: Record<string, unknown>) =>
  message.replace(/\{(\w+)\}/g, (_: string, key: string) => String(values?.[key] ?? ""));

const host = {
  ...newSimlockDeviceHost("simlock"),
  gatewayUrl: "https://gateway.example.ts.net:4700",
  agentToken: "agent",
};

describe("Simlock device host settings", () => {
  it("names what keeps a draft from saving", () => {
    expect(simlockDeviceHostProblem(host, gt)).toBeNull();
    expect(simlockDeviceHostProblem({ ...host, label: " " }, gt)).toBe("Give the host a label.");
    expect(simlockDeviceHostProblem({ ...host, gatewayUrl: "gateway:4700" }, gt)).toMatch(/origin/);
    expect(
      simlockDeviceHostProblem({ ...host, gatewayUrl: "https://gateway.example/api" }, gt),
    ).toMatch(/origin/);
    expect(simlockDeviceHostProblem({ ...host, maxLeases: 21 }, gt)).toMatch(/ranges/);
    expect(simlockDeviceHostProblem({ ...host, maxLeaseMinutes: 4 }, gt)).toMatch(/ranges/);
  });

  it("adds, replaces, and removes one host", () => {
    const other = { ...host, id: "other", label: "Other" };
    const added = updateSimlockDeviceHosts([other], host, false);
    expect(added.map((candidate) => candidate.id)).toEqual(["other", "simlock"]);
    const renamed = updateSimlockDeviceHosts(added, { ...host, label: "Renamed" }, false);
    expect(renamed.map((candidate) => candidate.label)).toEqual(["Other", "Renamed"]);
    expect(updateSimlockDeviceHosts(renamed, host, true)).toEqual([other]);
  });

  it("saves the shared fields everywhere and each environment's own token, if it has one", () => {
    const mbp = "mbp" as EnvironmentId;
    const cups = "cups" as EnvironmentId;
    const environments = [
      { environmentId: mbp, label: "mbp", hosts: [{ ...host, agentToken: "<redacted>" }] },
      { environmentId: cups, label: "cups", hosts: [] },
    ];
    const draft = { ...host, label: "Pool", agentToken: "" };

    expect(
      planSimlockDeviceHostSave(environments, draft, new Map([[mbp, { kind: "saved" }]]), gt),
    ).toEqual({
      patches: [
        { environmentId: mbp, hosts: [{ ...draft, agentToken: "<redacted>" }] },
        { environmentId: cups, hosts: [{ ...draft, agentToken: "" }] },
      ],
    });
    expect(
      planSimlockDeviceHostSave(
        environments,
        draft,
        new Map([
          [mbp, { kind: "saved" }],
          [cups, { kind: "new", value: " cups-token " }],
        ]),
        gt,
      ),
    ).toEqual({
      patches: [
        { environmentId: mbp, hosts: [{ ...draft, agentToken: "<redacted>" }] },
        { environmentId: cups, hosts: [{ ...draft, agentToken: "cups-token" }] },
      ],
    });
    const reference = { provider: SecretProviderId.make("homelab"), reference: "simlock#token" };
    expect(
      planSimlockDeviceHostSave(
        environments,
        draft,
        new Map([[cups, { kind: "new", value: reference }]]),
        gt,
      ),
    ).toMatchObject({
      patches: [{}, { environmentId: cups, hosts: [{ ...draft, agentToken: reference }] }],
    });
  });
});
