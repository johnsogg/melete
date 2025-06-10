// This takes a MeleteMouseEvent and returns a minimal string. It always shows x

import { MeleteMouseEvent } from "~/types";

// and y, and then if any keys were pressed it prints their names.
export function debugMouseEvent(event: MeleteMouseEvent): string {
    const keys = [];
    if (event.altKey) keys.push("Alt");
    if (event.ctrlKey) keys.push("Ctrl");
    if (event.metaKey) keys.push("Meta");
    if (event.shiftKey) keys.push("Shift");

    return `(${event.x}, ${event.y})${keys.length > 0 ? " " + keys.join("+") : ""}`;
}
