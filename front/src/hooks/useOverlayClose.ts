import { useEffect } from "react";

const HISTORY_KEY = "dropToMeOverlay";

let openedOverlayCount = 0;

const isObject = (value: unknown): value is object =>
  typeof value === "object" && value !== null;

const isOverlayEntry = (state: unknown, id: number) =>
  isObject(state) && HISTORY_KEY in state && state[HISTORY_KEY] === id;

// onClose must keep its identity while the overlay is open
export function useOverlayClose(isOpen: boolean, onClose: () => void): void {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    openedOverlayCount += 1;
    const id = openedOverlayCount;
    const currentState: unknown = window.history.state;
    window.history.pushState(
      { ...(isObject(currentState) ? currentState : {}), [HISTORY_KEY]: id },
      "",
    );

    let isClosedByHistory = false;
    const handlePopState = () => {
      isClosedByHistory = true;
      onClose();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("keydown", handleKeyDown);
      if (!isClosedByHistory && isOverlayEntry(window.history.state, id)) {
        window.history.back();
      }
    };
  }, [isOpen, onClose]);
}
