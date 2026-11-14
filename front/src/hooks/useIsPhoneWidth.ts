import { useSyncExternalStore } from "react";

// the max-md breakpoint of the theme
const PHONE_WIDTH_QUERY = "(width < 48rem)";

const subscribe = (onChange: () => void): (() => void) => {
  const query = window.matchMedia(PHONE_WIDTH_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

const readIsPhoneWidth = (): boolean =>
  window.matchMedia(PHONE_WIDTH_QUERY).matches;

export function useIsPhoneWidth(): boolean {
  return useSyncExternalStore(subscribe, readIsPhoneWidth, () => false);
}
