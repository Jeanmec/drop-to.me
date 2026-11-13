import type { ReactNode } from "react";
import { cn } from "@/library/utils";
import styles from "./Pennon.module.css";

type PennonTone = "plain" | "moon" | "alert" | "solid";
type PennonNotch = "end" | "start";

interface PennonProps {
  children: ReactNode;
  tone?: PennonTone;
  notch?: PennonNotch;
  className?: string;
}

const toneClass = (tone: PennonTone): string => {
  switch (tone) {
    case "plain":
      return "";
    case "moon":
      return styles.moon;
    case "alert":
      return styles.alert;
    case "solid":
      return styles.solid;
  }
};

export default function Pennon({
  children,
  tone = "plain",
  notch = "end",
  className,
}: PennonProps) {
  return (
    <span
      className={cn(
        "block",
        styles.pennon,
        toneClass(tone),
        notch === "start" && styles.notchStart,
        className,
      )}
    >
      {children}
    </span>
  );
}
