import { cn } from "@/library/utils";
import type { TBeamState } from "@/types/scene.t";
import { turnClass } from "./beamClasses";
import styles from "./Scene.module.css";

interface LampHaloProps {
  beam: TBeamState;
}

export default function LampHalo({ beam }: LampHaloProps) {
  return (
    <span
      className={cn(
        styles.halo,
        turnClass(beam),
        beam === "dark" && styles.dark,
      )}
      aria-hidden
    />
  );
}
