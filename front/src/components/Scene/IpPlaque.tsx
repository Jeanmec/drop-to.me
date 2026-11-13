"use client";

import { useIsStranded } from "@/hooks/useIsStranded";
import { cn } from "@/library/utils";
import { useUserStore } from "@/stores/useUserStore";
import styles from "./Scene.module.css";

export default function IpPlaque() {
  const ip = useUserStore((state) => state.ip);
  const isStranded = useIsStranded();

  if (!ip || isStranded) {
    return null;
  }

  return (
    <span
      className={cn(
        styles.plaque,
        "text-ash max-md:text-micro font-mono text-xs",
      )}
    >
      Your&nbsp;IP{" "}
      <span className={styles.plaqueValue} title={ip}>
        {ip}
      </span>
    </span>
  );
}
