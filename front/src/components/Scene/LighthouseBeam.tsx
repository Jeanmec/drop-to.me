import clsx from "clsx";
import type { BeamState } from "@/types/scene.t";
import { lightClass, turnClass } from "./beamClasses";
import styles from "./Scene.module.css";

interface LighthouseBeamProps {
  beam: BeamState;
}

export default function LighthouseBeam({ beam }: LighthouseBeamProps) {
  return (
    <div className={clsx(styles.skyclip, turnClass(beam))} aria-hidden>
      <div className={clsx(styles.fan, lightClass(beam))}>
        <i className={styles.fanRay} />
        <i className={styles.fanRay} />
        <i className={styles.fanRay} />
        <i className={styles.fanRay} />
        <i className={styles.fanRay} />
      </div>
    </div>
  );
}
