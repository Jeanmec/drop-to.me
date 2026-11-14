import { Hatch } from "@/types/scene.t";

interface HatchPattern {
  id: Hatch;
  stroke: string;
  gap: number;
  angle: number;
  width: number;
}

interface GlintField {
  id: Hatch;
  width: number;
  rows: number;
  gap: number;
  shortest: number;
  longest: number;
  strokeWidth: number;
  seed: number;
}

const HATCHES: HatchPattern[] = [
  { id: Hatch.VEIL, stroke: "stroke-dim", gap: 5, angle: 0, width: 1.15 },
  { id: Hatch.ROSE, stroke: "stroke-dim", gap: 6, angle: -35, width: 1.15 },
  { id: Hatch.SEA, stroke: "stroke-sea-line", gap: 9, angle: 0, width: 1.15 },
  { id: Hatch.FAR, stroke: "stroke-sea-line", gap: 5, angle: 0, width: 1.15 },
  { id: Hatch.LIT, stroke: "stroke-moon", gap: 9, angle: 0, width: 1.4 },
  { id: Hatch.LIT_FAR, stroke: "stroke-moon", gap: 5, angle: 0, width: 1.1 },
  { id: Hatch.MOON, stroke: "stroke-moon", gap: 3.6, angle: 0, width: 1.3 },
  { id: Hatch.ASHEN, stroke: "stroke-ash", gap: 3.6, angle: 0, width: 1.3 },
  { id: Hatch.ROCK, stroke: "stroke-rock", gap: 7, angle: -35, width: 1.15 },
  {
    id: Hatch.WOOD,
    stroke: "stroke-rock",
    gap: 3.4,
    angle: -35,
    width: 1.15,
  },
  { id: Hatch.GOLD, stroke: "stroke-moon", gap: 2.4, angle: 0, width: 1.1 },
  {
    id: Hatch.GRASS,
    stroke: "stroke-grass",
    gap: 3.6,
    angle: 0,
    width: 1.15,
  },
  { id: Hatch.CORAL, stroke: "stroke-coral", gap: 3, angle: 0, width: 1.15 },
  { id: Hatch.LAMP, stroke: "stroke-moon", gap: 2.4, angle: 0, width: 1.15 },
  { id: Hatch.HULL, stroke: "stroke-cream", gap: 3.6, angle: 0, width: 1.15 },
  {
    id: Hatch.SAIL_BLUSH,
    stroke: "stroke-blush",
    gap: 3.4,
    angle: -35,
    width: 1.15,
  },
  {
    id: Hatch.SAIL_LILAC,
    stroke: "stroke-lilac",
    gap: 3.4,
    angle: -35,
    width: 1.15,
  },
  {
    id: Hatch.SAIL_MOON,
    stroke: "stroke-moon",
    gap: 3.4,
    angle: -35,
    width: 1.15,
  },
];

const GLINT_FIELDS: GlintField[] = [
  {
    id: Hatch.GLINT,
    width: 240,
    rows: 6,
    gap: 9,
    shortest: 6,
    longest: 20,
    strokeWidth: 1.5,
    seed: 7,
  },
  {
    id: Hatch.GLINT_FAR,
    width: 160,
    rows: 4,
    gap: 5,
    shortest: 3,
    longest: 9,
    strokeWidth: 1.2,
    seed: 11,
  },
];

// each row sits on a line of the hatch that has the same gap
const glintStrokes = (field: GlintField): string => {
  let state = field.seed;
  const next = () => {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };

  let strokes = "";
  for (let row = 0; row < field.rows; row++) {
    let x = next() * field.longest;
    while (x < field.width - field.longest) {
      const end =
        x + field.shortest + next() * (field.longest - field.shortest);
      strokes += `M${x.toFixed(1)} ${field.gap / 2 + row * field.gap}H${end.toFixed(1)}`;
      x = end + field.shortest + next() * field.longest * 1.3;
    }
  }
  return strokes;
};

export default function HatchPatterns() {
  return (
    <svg
      className="absolute"
      width="0"
      height="0"
      aria-hidden
      focusable="false"
    >
      <defs>
        {HATCHES.map((hatch) => (
          <pattern
            key={hatch.id}
            id={hatch.id}
            patternUnits="userSpaceOnUse"
            width={hatch.gap}
            height={hatch.gap}
            patternTransform={`rotate(${hatch.angle})`}
          >
            <line
              className={hatch.stroke}
              x1="0"
              y1={hatch.gap / 2}
              x2={hatch.gap}
              y2={hatch.gap / 2}
              strokeWidth={hatch.width}
            />
          </pattern>
        ))}
        {GLINT_FIELDS.map((field) => (
          <pattern
            key={field.id}
            id={field.id}
            patternUnits="userSpaceOnUse"
            width={field.width}
            height={field.rows * field.gap}
          >
            <path
              className="stroke-moon"
              d={glintStrokes(field)}
              strokeWidth={field.strokeWidth}
              strokeLinecap="round"
            />
          </pattern>
        ))}
      </defs>
    </svg>
  );
}
