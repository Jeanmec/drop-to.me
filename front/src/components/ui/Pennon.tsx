import clsx from "clsx";
import type { ReactNode } from "react";
import { PennonTone } from "@/types/ui.t";
import styles from "./Pennon.module.css";

interface PennonProps {
  children: ReactNode;
  tone?: PennonTone;
  className?: string;
}

const toneClass = (tone: PennonTone): string | undefined => {
  switch (tone) {
    case PennonTone.PLAIN:
      return undefined;
    case PennonTone.MOON:
      return styles.moon;
    case PennonTone.ALERT:
      return styles.alert;
    case PennonTone.SIGNAL:
      return styles.signal;
  }
};

export default function Pennon({
  children,
  tone = PennonTone.PLAIN,
  className,
}: PennonProps) {
  return (
    <span className={clsx(styles.pennon, toneClass(tone), className)}>
      {children}
    </span>
  );
}
