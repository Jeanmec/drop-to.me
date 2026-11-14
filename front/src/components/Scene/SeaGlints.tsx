import clsx from "clsx";
import type { Hatch } from "@/types/scene.t";
import { hatchFill } from "@/utils/hatch.utils";
import styles from "./Scene.module.css";

interface SeaGlintsProps {
  far: Hatch;
  near: Hatch;
  className: string;
}

export default function SeaGlints({ far, near, className }: SeaGlintsProps) {
  return (
    <div className={clsx(styles.glints, className)}>
      <div className={styles.glintsDrift}>
        <svg className={styles.glintsSheet}>
          <rect width="100%" height="24%" fill={hatchFill(far)} />
          <rect y="24%" width="100%" height="76%" fill={hatchFill(near)} />
        </svg>
      </div>
    </div>
  );
}
