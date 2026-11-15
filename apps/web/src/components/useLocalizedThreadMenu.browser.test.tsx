import { describe, expect, it } from "vite-plus/test";
import { GTProvider } from "gt-react";
import { initializeI18n } from "../i18n/initializeI18n";
import zhTW from "../i18n/translations/zh-TW.json";
import { render } from "../../test/render";
import type { ContextMenuItem } from "@t3tools/contracts";

import { useLocalizedThreadMenu } from "./useLocalizedThreadMenu";

function Probe() {
  const localize = useLocalizedThreadMenu();
  const items: ContextMenuItem[] = [
    { id: "new-thread-on-branch", label: "New thread on feature/a", disabled: true },
    { id: "copy", label: "Copy", children: [{ id: "copy-path", label: "Path" }] },
    {
      id: "snooze",
      label: "Snooze",
      children: [
        { id: "snooze:after:60", label: "1 小時後", detail: "下午3:00" },
        { id: "snooze:custom", label: "Custom…" },
      ],
    },
  ];
  return <output>{JSON.stringify(localize(items))}</output>;
}

describe("sidebar menu localization", () => {
  it("translates actions while preserving branch names, snooze times and disabled state", async () => {
    initializeI18n(() => {});
    await using screen = await render(
      <GTProvider locale="zh-TW" translations={{ "zh-TW": zhTW }}>
        <Probe />
      </GTProvider>,
      { router: false },
    );
    const items = JSON.parse(screen.container.querySelector("output")?.textContent ?? "[]");
    expect(items[0]).toEqual({
      id: "new-thread-on-branch",
      label: "在 feature/a 上新增對話",
      disabled: true,
    });
    expect(items[1].children[0].label).toBe("路徑");
    expect(items[2].children).toEqual([
      { id: "snooze:after:60", label: "1 小時後", detail: "下午3:00" },
      { id: "snooze:custom", label: "自訂…" },
    ]);
  });
});
