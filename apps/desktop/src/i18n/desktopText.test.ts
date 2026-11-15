import { assert, describe, it } from "@effect/vitest";

import { desktopTranslator, resolveDesktopLocale } from "./desktopText.ts";

describe("resolveDesktopLocale", () => {
  it("prefers the saved language and follows system languages otherwise", () => {
    const cases: ReadonlyArray<[string, ReadonlyArray<string>, string]> = [
      ["zh-TW", ["en-US"], "zh-TW"],
      ["en", ["zh-TW"], "en"],
      // A language only the web client ships keeps the shell in English.
      ["ja", ["zh-TW"], "en"],
      ["zh", ["zh-TW"], "en"],
      ["system", ["zh-Hant-TW", "en-US"], "zh-TW"],
      ["system", ["zh-Hant"], "zh-TW"],
      ["system", ["zh_TW"], "zh-TW"],
      // Hong Kong and Macau Traditional skip Simplified zh and fall through.
      ["system", ["zh-HK", "en-GB"], "en"],
      ["system", ["zh-Hant-HK", "zh-TW"], "zh-TW"],
      ["system", ["zh-CN", "zh-TW"], "en"],
      ["system", ["fr-FR", "zh-TW"], "en"],
      ["system", [], "en"],
      ["unknown", ["zh-TW"], "zh-TW"],
    ];
    for (const [language, systemLanguages, expected] of cases) {
      assert.equal(
        resolveDesktopLocale(language, systemLanguages),
        expected,
        `${language} ${systemLanguages.join(",")}`,
      );
    }
  });
});

describe("desktopTranslator", () => {
  it("interpolates translated and untranslated text", () => {
    assert.equal(
      desktopTranslator("zh-TW")("Update to {version}", { version: "1.2.3" }),
      "更新至 1.2.3",
    );
    assert.equal(
      desktopTranslator("en")("Update to {version}", { version: "1.2.3" }),
      "Update to 1.2.3",
    );
    assert.equal(desktopTranslator("zh-TW")("Not in the table {x}"), "Not in the table {x}");
  });
});
