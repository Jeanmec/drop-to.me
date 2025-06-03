import { useEffect } from "react";

export function useAsyncEffect(
  effect: () => Promise<void>,
  deps: React.DependencyList,
) {
  useEffect(() => {
    void effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
