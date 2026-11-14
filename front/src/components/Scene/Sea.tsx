import clsx from "clsx";
import { BeamState, Hatch } from "@/types/scene.t";
import { hatchFill } from "@/utils/hatch.utils";
import { lightClass, turnClass } from "./beamClasses";
import SeaGlints from "./SeaGlints";
import styles from "./Scene.module.css";

interface SeaProps {
  beam: BeamState;
}

export default function Sea({ beam }: SeaProps) {
  const moonClass = beam === BeamState.DARK && styles.moonless;

  return (
    <div className={clsx(styles.sea, turnClass(beam))} aria-hidden>
      <svg className={styles.seaLayer}>
        <rect width="100%" height="100%" fill={hatchFill(Hatch.SEA)} />
        <rect className="fill-night" width="100%" height="24%" />
        <rect width="100%" height="24%" fill={hatchFill(Hatch.FAR)} />
      </svg>
      <SeaGlints
        far={Hatch.GLINT_FAR}
        near={Hatch.GLINT}
        className={clsx(styles.moonlit, moonClass)}
      />
      <SeaGlints
        far={Hatch.LIT_FAR}
        near={Hatch.LIT}
        className={clsx(styles.mooncore, moonClass)}
      />
      <div className={clsx(styles.foot, lightClass(beam))}>
        <SeaGlints
          far={Hatch.GLINT_FAR}
          near={Hatch.GLINT}
          className={styles.footlit}
        />
        <SeaGlints
          far={Hatch.LIT_FAR}
          near={Hatch.LIT}
          className={styles.footcore}
        />
      </div>
    </div>
  );
}
