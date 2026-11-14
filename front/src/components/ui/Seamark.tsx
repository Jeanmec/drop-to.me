import clsx from "clsx";
import type { ReactNode } from "react";
import { Hatch } from "@/types/scene.t";
import { hatchFill } from "@/utils/hatch.utils";
import styles from "./Seamark.module.css";

interface SeamarkProps {
  children: ReactNode;
  isSteady?: boolean;
  isOffbeat?: boolean;
  // the lantern flares each time the count grows
  signalCount?: number;
}

export default function Seamark({
  children,
  isSteady,
  isOffbeat,
  signalCount = 0,
}: SeamarkProps) {
  return (
    <span
      className={clsx(
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
          fill={hatchFill(Hatch.CORAL)}
        />
        <path className="inked fill-night stroke-cream" d="M5 70H39L35 79H9Z" />
        <path className="pen stroke-horizon" d="M0 82H13M31 83H44" />
      </svg>
      {signalCount > 0 && (
        <svg
          key={signalCount}
          className={styles.flare}
          viewBox="-24 -24 48 48"
          aria-hidden
        >
          <circle className="pen stroke-coral" r="8" />
          <path
            className="pen stroke-moon"
            d="M0-12V-19M0 12V19M-12 0H-19M12 0H19M-8.5-8.5L-13.4-13.4M8.5-8.5L13.4-13.4M-8.5 8.5L-13.4 13.4M8.5 8.5L13.4 13.4"
          />
        </svg>
      )}
      {children}
    </span>
  );
}
