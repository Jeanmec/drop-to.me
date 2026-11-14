import clsx from "clsx";
import { CloudSize, Hatch } from "@/types/scene.t";
import { hatchFill } from "@/utils/hatch.utils";
import Cloud from "./Cloud";
import styles from "./Scene.module.css";

interface NightSkyProps {
  isLit: boolean;
}

interface Star {
  x: number;
  y: number;
}

const STARS: Star[] = [
  { x: 4, y: 44 },
  { x: 8, y: 36 },
  { x: 22, y: 8 },
  { x: 23, y: 45 },
  { x: 38, y: 6 },
  { x: 47, y: 3 },
  { x: 57, y: 46 },
  { x: 62, y: 7 },
  { x: 80, y: 27 },
  { x: 84, y: 38 },
  { x: 96, y: 30 },
  { x: 86, y: 54 },
  { x: 18, y: 55 },
  { x: 52, y: 60 },
  { x: 21, y: 26 },
  { x: 78, y: 9 },
];

export default function NightSky({ isLit }: NightSkyProps) {
  return (
    <>
      <svg className={styles.sky} aria-hidden>
        {STARS.map((star) => (
          <svg
            key={`${star.x}-${star.y}`}
            x={`${star.x}%`}
            y={`${star.y}%`}
            overflow="visible"
          >
            <path className="pen stroke-ash" d="M-3.5 0H3.5M0-3.5V3.5" />
          </svg>
        ))}
      </svg>
      <svg className={styles.moon} viewBox="-62 -62 124 124" aria-hidden>
        <circle
          className={clsx(
            "inked stroke-ash",
            styles.hatch,
            isLit && "opacity-0",
          )}
          r="50"
          fill={hatchFill(Hatch.ASHEN)}
          pathLength={1}
        />
        <circle
          className={clsx(
            "inked stroke-moon",
            styles.hatch,
            !isLit && "opacity-0",
          )}
          r="50"
          fill={hatchFill(Hatch.MOON)}
          pathLength={1}
        />
      </svg>
      <Cloud size={CloudSize.WIDE} isLit={isLit} />
      <Cloud size={CloudSize.MID} isLit={isLit} />
      <Cloud size={CloudSize.SMALL} isLit={isLit} />
    </>
  );
}
