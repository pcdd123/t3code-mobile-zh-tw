import { describe, expect, it } from "vite-plus/test";
import { resolveLocale } from "./locales.ts";

describe("resolveLocale", () => {
  const supported = ["en", "zh", "zh-TW"];

  it("selects Taiwan Chinese for system locale variants", () => {
    for (const tag of ["zh-TW", "zh_TW", "zh-Hant", "zh-Hant-TW", "zh-TW-u-nu-hanidec"]) {
      expect(resolveLocale("system", [tag], supported, "en")).toBe("zh-TW");
    }
  });

  it("does not use Simplified Chinese for other Traditional Chinese locales", () => {
    expect(resolveLocale("system", ["zh-Hant-HK"], supported, "en")).toBe("en");
  });

  it("respects an explicit selection and falls back to English", () => {
    expect(resolveLocale("zh", ["zh-TW"], supported, "en")).toBe("zh");
    expect(resolveLocale("system", ["de"], supported, "en")).toBe("en");
  });
});
