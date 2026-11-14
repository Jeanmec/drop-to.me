"use client";

import { useIsStranded } from "@/hooks/useIsStranded";
import clsx from "clsx";
import { useSessionStore } from "@/stores/useSessionStore";
import styles from "./Scene.module.css";

export default function IpPlaque() {
  const ip = useSessionStore((state) => state.ip);
  const isStranded = useIsStranded();

  if (!ip || isStranded) {
    return null;
  }

  return (
    <span
      className={clsx(
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
