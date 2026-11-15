import type { useGT } from "gt-react-native";

export type Translate = ReturnType<typeof useGT>;

/** English with `{name}` placeholders filled, for imperative code that runs before GT renders. */
const englishGt = ((message: string, values?: Record<string, unknown>) =>
  message
    .replace(/\{(\w+)\}/g, (_: string, key: string) => String(values?.[key] ?? ""))
    .replaceAll("''", "'")) as unknown as Translate;

let current: Translate = englishGt;

/**
 * The translator for code that runs outside React (native alerts opened by app-lifetime
 * services, widget snapshots). English until the app's I18nProvider first renders.
 */
export function getTranslator(): Translate {
  return current;
}

/** Called by I18nProvider on every render, before the screens inside it render. */
export function adoptTranslator(gt: Translate): void {
  current = gt;
}
