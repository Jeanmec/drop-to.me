import { useEffect, useRef, useState } from "react";

/**
 * Keeps a boolean `true` for at least `minDurationMs` once activated,
 * preventing UI flashes when the underlying operation completes too fast.
 */
export function useMinimumDuration(
  active: boolean,
  minDurationMs: number,
): boolean {
  const [held, setHeld] = useState(active);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (active) {
      startTimeRef.current = Date.now();
      setHeld(true);
      return;
    }

    if (startTimeRef.current === null) {
      setHeld(false);
      return;
    }

    const elapsed = Date.now() - startTimeRef.current;
    const remaining = Math.max(0, minDurationMs - elapsed);

    const timer = setTimeout(() => {
      setHeld(false);
      startTimeRef.current = null;
    }, remaining);

    return () => clearTimeout(timer);
  }, [active, minDurationMs]);

  return held;
}
