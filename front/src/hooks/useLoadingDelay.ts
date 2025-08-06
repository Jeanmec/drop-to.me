import { useEffect, useState } from "react";

let globalReady = false;
let globalCallbacks: (() => void)[] = [];

export function useLoadingDelay(): boolean {
  const [ready, setReady] = useState(globalReady);

  useEffect(() => {
    if (globalReady) return;

    globalCallbacks.push(() => setReady(true));

    if (globalCallbacks.length === 1) {
      const baseDelay = Number(
        process.env.NEXT_PUBLIC_LOADING_SCREEN_DURATION ?? "0",
      );
      const animationDuration = 500;
      const totalDelay = baseDelay - animationDuration;

      setTimeout(() => {
        globalReady = true;
        globalCallbacks.forEach((cb) => cb());
        globalCallbacks = [];
      }, totalDelay);
    }

    return () => {
      globalCallbacks = globalCallbacks.filter((cb) => cb !== setReady);
    };
  }, []);

  return ready;
}
