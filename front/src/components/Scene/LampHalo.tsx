import clsx from "clsx";
import { BeamState } from "@/types/scene.t";
import { turnClass } from "./beamClasses";
import styles from "./Scene.module.css";

interface LampHaloProps {
  beam: BeamState;
}

export default function LampHalo({ beam }: LampHaloProps) {
  return (
    <span
      className={clsx(
        styles.halo,
        turnClass(beam),
        beam === BeamState.DARK && styles.dark,
      )}
      aria-hidden
    />
  );
}
