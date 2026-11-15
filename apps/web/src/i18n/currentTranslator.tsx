import { useGT } from "gt-react";
import { useLayoutEffect } from "react";

import { englishGt, type Translate } from "../components/Localized";

let current: Translate = englishGt;
let notified: Translate = englishGt;
const listeners = new Set<() => void>();

/**
 * The translator for code that runs outside React (system notifications, screen reader
 * announcements, the window title). English until the app's I18nProvider first renders.
 */
export function getTranslator(): Translate {
  return current;
}

/** Calls `listener` after the language changes, for text written outside React. */
export function subscribeTranslator(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function adopt(gt: Translate): void {
  current = gt;
}

/** Rendered first inside the GT provider, so children rendering in the same pass read it. */
export function CurrentTranslator() {
  const gt = useGT();
  adopt(gt);
  // oxlint-disable-next-line t3code/no-unreasoned-state-sync -- tells text written outside React, such as the window title, that the language changed
  useLayoutEffect(() => {
    if (notified === current) return;
    notified = current;
    for (const listener of listeners) listener();
  });
  return null;
}
