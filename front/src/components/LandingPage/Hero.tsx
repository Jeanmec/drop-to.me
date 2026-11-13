import type { ReactNode } from "react";
import { cn } from "@/library/utils";
import type { TScenePhase } from "@/types/scene.t";
import styles from "./Hero.module.css";

interface HeroProps {
  phase: TScenePhase;
  note?: ReactNode;
  children?: ReactNode;
}

const titleClass = (phase: TScenePhase): string => {
  switch (phase) {
    case "sketched":
      return `${styles.outlined} ${styles.unrolling}`;
    case "washed":
      return styles.outlined;
    case "painted":
      return "";
  }
};

export default function Hero({ phase, note, children }: HeroProps) {
  const isStowed = phase !== "painted";

  return (
    <div className={styles.headline}>
      <h1 className={cn(styles.title, titleClass(phase))}>
        <span className={styles.titleShadow} aria-hidden>
          {process.env.NEXT_PUBLIC_WEBSITE_NAME}
        </span>
        <span className={styles.titleInk}>
          {process.env.NEXT_PUBLIC_WEBSITE_NAME}
        </span>
      </h1>
      <div
        className={cn(styles.deck, isStowed && styles.stowed)}
        inert={isStowed}
      >
        <p className={cn(styles.tagline, "text-lead max-md:text-base")}>
          Share large files over your local network with peer-to-peer
          technology.
        </p>
        {children}
      </div>
      <p
        role="status"
        className={cn(styles.note, "text-ash text-label font-mono")}
      >
        {note}
      </p>
    </div>
  );
}
