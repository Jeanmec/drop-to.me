import { cn } from "@/library/utils";
import type { TBeamState } from "@/types/scene.t";
import { lightClass, turnClass } from "./beamClasses";
import SeaGlints from "./SeaGlints";
import styles from "./Scene.module.css";

interface SeaProps {
  beam: TBeamState;
}

export default function Sea({ beam }: SeaProps) {
  const moonClass = beam === "dark" ? styles.moonless : "";

  return (
    <div className={cn(styles.sea, turnClass(beam))} aria-hidden>
      <svg className={styles.seaLayer}>
        <rect width="100%" height="100%" fill="url(#hatch-sea)" />
        <rect className="fill-night" width="100%" height="24%" />
        <rect width="100%" height="24%" fill="url(#hatch-far)" />
      </svg>
      <SeaGlints kind="scattered" className={cn(styles.moonlit, moonClass)} />
      <SeaGlints kind="lit" className={cn(styles.mooncore, moonClass)} />
      <div className={cn(styles.foot, lightClass(beam))}>
        <SeaGlints kind="scattered" className={styles.footlit} />
        <SeaGlints kind="lit" className={styles.footcore} />
      </div>
    </div>
  );
}
