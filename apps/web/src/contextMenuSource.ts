import type { ContextMenuSource } from "@t3tools/contracts";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

// Chromium uses no button for keyboard context menus and zero clicks for keyboard activation.
export function contextMenuSourceOf(
  event: Pick<MouseEvent, "type" | "button" | "detail">,
): ContextMenuSource {
  return (event.type === "click" ? event.detail === 0 : event.button === -1) ? "keyboard" : "mouse";
}

// Chromium turns Shift+F10 into a buttonless contextmenu PointerEvent everywhere but macOS.
// Send that event ourselves so the element's own menu handler runs there too; preventing the
// keydown stops Chromium's copy elsewhere. The Menu key is left to Chromium: Windows fires it
// on keyup.
export function openContextMenuOnShiftF10(event: ReactKeyboardEvent<HTMLElement>): void {
  if (
    event.defaultPrevented ||
    event.nativeEvent.isComposing ||
    event.key !== "F10" ||
    !event.shiftKey ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey
  ) {
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  const bounds = event.currentTarget.getBoundingClientRect();
  event.currentTarget.dispatchEvent(
    new PointerEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      button: -1,
      clientX: bounds.left,
      clientY: bounds.bottom,
    }),
  );
}
