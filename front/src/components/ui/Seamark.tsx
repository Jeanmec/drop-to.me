import type { ReactNode } from "react";
import { cn } from "@/library/utils";
import styles from "./Seamark.module.css";

interface SeamarkProps {
  children: ReactNode;
  isSteady?: boolean;
  isOffbeat?: boolean;
}

export default function Seamark({
  children,
  isSteady,
  isOffbeat,
}: SeamarkProps) {
  return (
    <span
      className={cn(
        styles.bobber,
        isOffbeat && styles.offbeat,
        isSteady && styles.steady,
      )}
    >
      <svg className={styles.float} viewBox="0 0 44 84" aria-hidden>
        <path className="pen stroke-cream" d="M22 44V4" />
        <circle className="fill-moon" cx="22" cy="3" r="2.4" />
        <path className="fill-night" d="M15 44H29L34 70H10Z" />
        <path
          className="inked stroke-cream"
          d="M15 44H29L34 70H10Z"
          fill="url(#hatch-coral)"
        />
        <path className="inked fill-night stroke-cream" d="M5 70H39L35 79H9Z" />
        <path className="pen stroke-horizon" d="M0 82H13M31 83H44" />
      </svg>
      {children}
    </span>
  );
}
