import { useEffect } from "react";

export const useWindowResize = (callback: () => void) => {
  useEffect(() => {
    callback();
    window.addEventListener("resize", callback);

    return () => {
      window.removeEventListener("resize", callback);
    };
  }, [callback]);
};
