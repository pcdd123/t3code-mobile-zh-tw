import { useGT } from "gt-react";
import { createElement, Fragment, type ReactNode } from "react";

export type Translate = ReturnType<typeof useGT>;

/** English text with `{name}` placeholders filled, for callers with no translator in scope. */
export const englishGt = ((message: string, values?: Record<string, unknown>) =>
  message.replace(/\{(\w+)\}/g, (_: string, key: string) =>
    String(values?.[key] ?? ""),
  )) as unknown as Translate;

function Localized(props: { readonly render: (gt: Translate) => ReactNode }) {
  const gt = useGT();
  return props.render(gt);
}

/** Text that translates when it renders, for toasts raised outside React, where no hook runs. */
export function localized(render: (gt: Translate) => ReactNode): ReactNode {
  return createElement(Localized, { render });
}

const SLOT = "\u0000";

/**
 * Renders a translated sentence with one element inside it, such as a bold name or a code span:
 * `withSlot((slot) => gt("Use {command} anywhere.", { command: slot }), <code>t3</code>)`.
 */
export function withSlot(sentence: (slot: string) => string, content: ReactNode): ReactNode {
  const [before = "", after = ""] = sentence(SLOT).split(SLOT);
  return createElement(Fragment, null, before, content, after);
}

/** Placeholder values that keep `{name}` in translated text so `withNodes` can swap it for markup. */
export const keepPlaceholders = (...names: string[]) =>
  Object.fromEntries(names.map((name) => [name, `{${name}}`]));

/** Renders a translated sentence with several elements inside it, one per `{name}` placeholder. */
export function withNodes(text: string, nodes: Record<string, ReactNode>): ReactNode[] {
  const seen = new Map<string, number>();
  return text.split(/(\{\w+\})/).map((part) => {
    const name = /^\{(\w+)\}$/.exec(part)?.[1];
    if (name === undefined || !(name in nodes)) return part;
    const occurrence = (seen.get(name) ?? 0) + 1;
    seen.set(name, occurrence);
    return createElement(Fragment, { key: `${name}-${occurrence}` }, nodes[name]);
  });
}
