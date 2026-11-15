import { SYSTEM_LANGUAGE } from "@t3tools/client-runtime/locales";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";

import * as ElectronApp from "../electron/ElectronApp.ts";
import * as DesktopClientSettings from "../settings/DesktopClientSettings.ts";
import { resolveDesktopLocale, type DesktopLocale } from "./desktopText.ts";

/** The shell's UI language, read on each use so a saved setting applies to the next menu or dialog. */
export class DesktopLanguage extends Context.Reference<{
  readonly locale: Effect.Effect<DesktopLocale>;
}>("@t3tools/desktop/i18n/DesktopLanguage", {
  defaultValue: () => ({ locale: Effect.succeed<DesktopLocale>("en") }),
}) {}

export const layer = Layer.effect(
  DesktopLanguage,
  Effect.gen(function* () {
    const clientSettings = yield* DesktopClientSettings.DesktopClientSettings;
    const electronApp = yield* ElectronApp.ElectronApp;
    return {
      locale: Effect.gen(function* () {
        const settings = yield* clientSettings.get.pipe(Effect.orElseSucceed(Option.none));
        return resolveDesktopLocale(
          Option.match(settings, {
            onNone: () => SYSTEM_LANGUAGE,
            onSome: ({ language }) => language,
          }),
          yield* electronApp.preferredSystemLanguages,
        );
      }).pipe(Effect.withSpan("DesktopLanguage.locale")),
    };
  }),
);
