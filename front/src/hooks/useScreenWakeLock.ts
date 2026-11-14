import { useEffect } from "react";

export function useScreenWakeLock(isActive: boolean): void {
  useEffect(() => {
    if (!isActive || !("wakeLock" in navigator)) {
      return;
    }

    let sentinel: WakeLockSentinel | null = null;
    let isCleanedUp = false;

    const acquire = async () => {
      if (document.hidden) {
        return;
      }

      try {
        const acquired = await navigator.wakeLock.request("screen");
        if (isCleanedUp) {
          void acquired.release();
          return;
        }
        sentinel = acquired;
      } catch {
        return;
      }
    };

    // the browser releases the lock whenever the page is hidden
    const handleVisibilityChange = () => {
      void acquire();
    };

    void acquire();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isCleanedUp = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      void sentinel?.release();
    };
  }, [isActive]);
}
