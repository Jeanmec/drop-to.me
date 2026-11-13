import { useId } from "react";
import { cn } from "@/library/utils";
import styles from "./Scene.module.css";

type CloudSize = "wide" | "mid" | "small";

interface Bump {
  x: number;
  y: number;
  radius: number;
}

interface CloudShape {
  className: string;
  width: number;
  height: number;
  baseX: number;
  baseY: number;
  bumps: Bump[];
}

interface CloudProps {
  size: CloudSize;
  isLit: boolean;
}

const shapeOf = (size: CloudSize): CloudShape => {
  switch (size) {
    case "wide":
      return {
        className: styles.cloudWide,
        width: 230,
        height: 96,
        baseX: 22,
        baseY: 88,
        bumps: [
          { x: 26, y: 50, radius: 20 },
          { x: 78, y: 28, radius: 31 },
          { x: 142, y: 26, radius: 35 },
          { x: 186, y: 50, radius: 27 },
          { x: 208, y: 88, radius: 23 },
        ],
      };
    case "mid":
      return {
        className: styles.cloudMid,
        width: 150,
        height: 62,
        baseX: 14,
        baseY: 56,
        bumps: [
          { x: 18, y: 32, radius: 13 },
          { x: 52, y: 16, radius: 20 },
          { x: 96, y: 18, radius: 23 },
          { x: 124, y: 34, radius: 17 },
          { x: 136, y: 56, radius: 13 },
        ],
      };
    case "small":
      return {
        className: styles.cloudSmall,
        width: 118,
        height: 46,
        baseX: 10,
        baseY: 42,
        bumps: [
          { x: 14, y: 24, radius: 10 },
          { x: 42, y: 10, radius: 16 },
          { x: 78, y: 12, radius: 19 },
          { x: 100, y: 26, radius: 14 },
          { x: 108, y: 42, radius: 9 },
        ],
      };
  }
};

const arcTo = (bump: Bump): string =>
  `A${bump.radius} ${bump.radius} 0 0 1 ${bump.x} ${bump.y}`;

export default function Cloud({ size, isLit }: CloudProps) {
  const clipId = useId();
  const shape = shapeOf(size);
  const [, crest, ...moonward] = shape.bumps;
  const outline = `M${shape.baseX} ${shape.baseY}${shape.bumps.map(arcTo).join("")}Z`;
  const sheen = `M${crest.x} ${crest.y}${moonward.slice(0, 2).map(arcTo).join("")}`;

  return (
    <svg
      className={cn(styles.cloud, shape.className)}
      viewBox={`0 0 ${shape.width} ${shape.height}`}
      aria-hidden
    >
      <clipPath id={clipId}>
        <path d={outline} />
      </clipPath>
      <path className="fill-night" d={outline} />
      <g className={styles.veil} clipPath={`url(#${clipId})`}>
        <path
          d={outline}
          transform="translate(-7 11)"
          fill="url(#hatch-veil)"
        />
      </g>
      <path className={styles.rim} d={outline} pathLength={1} />
      <path className={cn(styles.sheen, !isLit && styles.sheenOut)} d={sheen} />
    </svg>
  );
}
