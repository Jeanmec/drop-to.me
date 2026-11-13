import { cn } from "@/library/utils";
import type { TBeamState } from "@/types/scene.t";
import { lightClass, turnClass } from "./beamClasses";
import styles from "./Scene.module.css";

interface LighthouseBeamProps {
  beam: TBeamState;
}

export default function LighthouseBeam({ beam }: LighthouseBeamProps) {
  return (
    <div className={cn(styles.skyclip, turnClass(beam))} aria-hidden>
      <div className={cn(styles.fan, lightClass(beam))}>
        <i className={styles.fanRay} />
        <i className={styles.fanRay} />
        <i className={styles.fanRay} />
        <i className={styles.fanRay} />
        <i className={styles.fanRay} />
      </div>
    </div>
  );
}
