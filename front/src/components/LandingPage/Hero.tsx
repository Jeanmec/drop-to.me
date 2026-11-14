import type { ReactNode } from "react";
import clsx from "clsx";
import { env } from "@/env";
import { ScenePhase } from "@/types/scene.t";
import styles from "./Hero.module.css";

interface HeroProps {
  phase: ScenePhase;
  note?: ReactNode;
  children?: ReactNode;
}

const titleClass = (phase: ScenePhase): string | undefined => {
  switch (phase) {
    case ScenePhase.SKETCHED:
      return clsx(styles.outlined, styles.unrolling);
    case ScenePhase.WASHED:
      return styles.outlined;
    case ScenePhase.PAINTED:
      return undefined;
  }
};

export default function Hero({ phase, note, children }: HeroProps) {
  const isStowed = phase !== ScenePhase.PAINTED;

  return (
    <div className={styles.headline}>
      <h1 className={clsx(styles.title, titleClass(phase))}>
        <span className={styles.titleShadow} aria-hidden>
          {env.NEXT_PUBLIC_WEBSITE_NAME}
        </span>
        <span className={styles.titleInk}>{env.NEXT_PUBLIC_WEBSITE_NAME}</span>
      </h1>
      <div
        className={clsx(styles.deck, isStowed && styles.stowed)}
        inert={isStowed}
      >
        <p className={clsx(styles.tagline, "text-lead max-md:text-base")}>
          Share large files over your local network with peer-to-peer
          technology.
        </p>
        {children}
      </div>
      <p
        role="status"
        className={clsx(styles.note, "text-ash text-label font-mono")}
      >
        {note}
      </p>
    </div>
  );
}
