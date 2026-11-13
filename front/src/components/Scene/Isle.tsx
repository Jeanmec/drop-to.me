import { cn } from "@/library/utils";
import styles from "./Scene.module.css";

interface IsleProps {
  isLit: boolean;
}

export default function Isle({ isLit }: IsleProps) {
  const lampClass = isLit ? "inked stroke-moon" : "inked fill-night stroke-dim";
  const lampFill = isLit ? "url(#hatch-lamp)" : undefined;

  return (
    <svg className={styles.isle} viewBox="0 0 420 520" aria-hidden>
      <g className={styles.ground}>
        <path
          className="fill-night"
          d="M0 520L34 470L70 452L104 414L150 398H300L332 420L360 462L396 486L420 520Z"
        />
        <path
          className={cn("inked stroke-rock", styles.hatch)}
          d="M0 520L34 470L70 452L104 414L150 398H300L332 420L360 462L396 486L420 520Z"
          fill="url(#hatch-rock)"
          pathLength={1}
        />
        <path
          className="fill-night"
          d="M104 414L150 398H300L332 420L296 411H152Z"
        />
        <path
          className={cn("inked stroke-grass", styles.hatch)}
          d="M104 414L150 398H300L332 420L296 411H152Z"
          fill="url(#hatch-grass)"
          pathLength={1}
        />
      </g>

      <g className={styles.tower}>
        <path
          className="inked fill-night stroke-cream"
          d="M176 400L190 150H230L244 400Z"
          pathLength={1}
        />
        <path
          className={styles.hatch}
          d="M176 400H244L241.2 350H178.8Z"
          fill="url(#hatch-coral)"
        />
        <path
          className={styles.hatch}
          d="M181.6 300H238.4L235.6 250H184.4Z"
          fill="url(#hatch-coral)"
        />
        <path
          className={styles.hatch}
          d="M187.2 200H232.8L230 150H190Z"
          fill="url(#hatch-coral)"
        />
        <path
          className="pen stroke-coral"
          d="M178.8 350H241.2M181.6 300H238.4M184.4 250H235.6M187.2 200H232.8"
          pathLength={1}
        />
      </g>

      <g className={styles.openings}>
        <path
          className="pen stroke-cream"
          d="M203 400V383Q210 372 217 383V400"
          pathLength={1}
        />
        <rect
          className="inked fill-night stroke-cream"
          x="206"
          y="318"
          width="8"
          height="12"
          pathLength={1}
        />
        <rect
          className="inked fill-night stroke-cream"
          x="206"
          y="222"
          width="8"
          height="12"
          pathLength={1}
        />
      </g>

      <g className={styles.lantern}>
        <path
          className="pen stroke-cream"
          d="M180 150H240M184 150V138H236V150M184 144H236"
          pathLength={1}
        />
        <rect
          className="inked fill-night stroke-cream"
          x="194"
          y="100"
          width="32"
          height="38"
          pathLength={1}
        />
        <path
          className="pen stroke-cream"
          d="M202 100V138M218 100V138"
          pathLength={1}
        />
        <circle className="fill-night" cx="210" cy="119" r="9" />
        <circle
          className={cn(lampClass, styles.hatch, styles.lamp)}
          cx="210"
          cy="119"
          r="7"
          fill={lampFill}
          pathLength={1}
        />
      </g>

      <g className={styles.cap}>
        <path className="fill-night" d="M188 100H232L210 76Z" />
        <path
          className={cn("inked stroke-coral", styles.hatch)}
          d="M188 100H232L210 76Z"
          fill="url(#hatch-coral)"
          pathLength={1}
        />
        <path className="pen stroke-cream" d="M210 76V64" pathLength={1} />
      </g>

      <g className={styles.cottage}>
        <rect
          className="inked fill-night stroke-cream"
          x="254"
          y="370"
          width="40"
          height="28"
          pathLength={1}
        />
        <path className="fill-night" d="M249 370L274 351L299 370Z" />
        <path
          className={cn("inked stroke-coral", styles.hatch)}
          d="M249 370L274 351L299 370Z"
          fill="url(#hatch-coral)"
          pathLength={1}
        />
        <rect
          className={cn(lampClass, styles.hatch)}
          x="262"
          y="378"
          width="9"
          height="10"
          fill={lampFill}
          pathLength={1}
        />
        <rect
          className="pen stroke-cream"
          x="279"
          y="382"
          width="8"
          height="16"
          pathLength={1}
        />
      </g>
    </svg>
  );
}
