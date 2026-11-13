import type { TBerth } from "@/types/scene.t";
import styles from "./Fleet.module.css";

interface BoatRigProps {
  berth: TBerth;
}

export default function BoatRig({ berth }: BoatRigProps) {
  switch (berth) {
    case "west":
      return (
        <svg className={styles.rig} viewBox="0 0 120 132" aria-hidden>
          <path className="fill-night" d="M12 92H108L96 112H24Z" />
          <path
            className="inked stroke-cream"
            d="M12 92H108L96 112H24Z"
            fill="url(#hatch-hull)"
          />
          <path className="pen stroke-cream" d="M60 92V16" />
          <path className="fill-night" d="M64 22V86H102Z" />
          <path
            className="inked stroke-blush"
            d="M64 22V86H102Z"
            fill="url(#hatch-sail-blush)"
          />
          <path className="inked fill-night stroke-lilac" d="M56 30V86H24Z" />
          <path
            className="pen stroke-horizon"
            d="M6 120H40M52 124H92M30 129H66"
          />
        </svg>
      );
    case "east":
      return (
        <svg className={styles.rig} viewBox="0 0 120 132" aria-hidden>
          <path className="fill-night" d="M12 92H108L96 112H24Z" />
          <path
            className="inked stroke-cream"
            d="M12 92H108L96 112H24Z"
            fill="url(#hatch-hull)"
          />
          <path className="pen stroke-cream" d="M60 92V16" />
          <path className="fill-night" d="M56 22V86H18Z" />
          <path
            className="inked stroke-lilac"
            d="M56 22V86H18Z"
            fill="url(#hatch-sail-lilac)"
          />
          <path className="inked fill-night stroke-blush" d="M64 34V86H94Z" />
          <path
            className="pen stroke-horizon"
            d="M10 120H50M60 125H104M34 129H70"
          />
        </svg>
      );
    case "cove":
      return (
        <svg className={styles.rig} viewBox="0 0 120 132" aria-hidden>
          <path className="fill-night" d="M16 92H104L92 112H28Z" />
          <path
            className="inked stroke-cream"
            d="M16 92H104L92 112H28Z"
            fill="url(#hatch-hull)"
          />
          <path className="pen stroke-cream" d="M60 92V16" />
          <path className="fill-night" d="M64 26V86H96Z" />
          <path
            className="inked stroke-moon"
            d="M64 26V86H96Z"
            fill="url(#hatch-sail-moon)"
          />
          <path className="pen stroke-horizon" d="M14 120H46M58 125H98" />
        </svg>
      );
  }
}
