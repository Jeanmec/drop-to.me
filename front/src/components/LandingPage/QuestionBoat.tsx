import GoldCoin from "@/components/Icons/GoldCoin";
import clsx from "clsx";
import { Hatch, QuestionBoatKind } from "@/types/scene.t";
import { hatchFill } from "@/utils/hatch.utils";
import styles from "./QuestionFleet.module.css";

interface QuestionBoatProps {
  kind: QuestionBoatKind;
  isLit: boolean;
}

interface CoinSpot {
  x: number;
  y: number;
}

const COIN_PILE: CoinSpot[] = [
  { x: 25, y: 58 },
  { x: 33, y: 58 },
  { x: 41, y: 58 },
  { x: 29, y: 51 },
  { x: 37, y: 51 },
  { x: 33, y: 44 },
];

export default function QuestionBoat({ kind, isLit }: QuestionBoatProps) {
  const gear = clsx(
    "transition-opacity duration-300 ease-out",
    isLit ? "opacity-100" : "opacity-55",
  );
  const lantern = clsx(
    "transition-colors duration-300 ease-out",
    isLit ? "fill-moon" : "fill-dim",
  );

  switch (kind) {
    case QuestionBoatKind.CUTTER:
      return (
        <svg className={styles.skiff} viewBox="0 0 96 88" aria-hidden>
          <path className="fill-night" d="M18 62H78L70 78H26Z" />
          <path
            className="inked stroke-cream"
            d="M18 62H78L70 78H26Z"
            fill={hatchFill(Hatch.HULL)}
          />
          <path className="pen stroke-cream" d="M48 62V9" />
          <g className={gear}>
            <path className="fill-night" d="M51 20V57H77Z" />
            <path
              className="inked stroke-blush"
              d="M51 20V57H77Z"
              fill={hatchFill(Hatch.SAIL_BLUSH)}
            />
            <path
              className="inked fill-night stroke-moon"
              d="M48 10H59L56.5 13L59 16H48"
            />
            <path className="fill-night" d="M23 46H39V62H23Z" />
            <path
              className="inked stroke-cream"
              d="M23 46H39V62H23Z"
              fill={hatchFill(Hatch.WOOD)}
            />
            <path className="pen stroke-cream" d="M23 46L39 62M39 46L23 62" />
          </g>
          <circle className={lantern} cx="48" cy="5" r="3" />
        </svg>
      );
    case QuestionBoatKind.PERISCOPE:
      return (
        <svg className={styles.skiff} viewBox="0 0 96 88" aria-hidden>
          <path
            className="pen stroke-horizon"
            d="M20 83.5q5-4 10 0M66 83.5q5-4 10 0"
          />
          <path className="fill-night" d="M43 46H53V84H43Z" />
          <path
            className="inked stroke-cream"
            d="M43 46H53V84H43Z"
            fill={hatchFill(Hatch.HULL)}
          />
          <g className={gear}>
            <path
              className="inked fill-night stroke-cream"
              d="M43 46V26Q43 18 51 18H66V30H53V46Z"
            />
            <path className="pen stroke-cream" d="M43 42H53M66 18V30" />
          </g>
          <circle className={lantern} cx="60" cy="24" r="3.2" />
        </svg>
      );
    case QuestionBoatKind.GALLEON:
      return (
        <svg className={styles.skiff} viewBox="0 0 96 88" aria-hidden>
          <path className="pen stroke-cream" d="M14 52L2 45" />
          <path
            className="fill-night"
            d="M8 50L22 78H74L86 62V46H72V56H24L14 52Z"
          />
          <path
            className="inked stroke-cream"
            d="M8 50L22 78H74L86 62V46H72V56H24L14 52Z"
            fill={hatchFill(Hatch.HULL)}
          />
          <path
            className="inked fill-night stroke-cream"
            d="M31 62h5v5h-5zM45 62h5v5h-5zM59 62h5v5h-5z"
          />
          <path className="pen stroke-cream" d="M48 56V7M30 56V22M70 46V26" />
          <g className={gear}>
            <path
              className="inked fill-night stroke-ash"
              d="M35 17H61Q65 31 63 44H33Q31 31 35 17Z"
            />
            <path
              className="inked fill-night stroke-ash"
              d="M22 28H38Q41 37 39 46H21Q19 37 22 28Z"
            />
            <path
              className="inked fill-night stroke-ash"
              d="M64 30H76Q79 37 77 43H63Q61 37 64 30Z"
            />
            <path className="pen stroke-cream" d="M41 34L55 41M55 34L41 41" />
            <circle
              className="inked fill-night stroke-cream"
              cx="48"
              cy="29"
              r="5"
            />
            <path className="pen stroke-cream" d="M45.5 34.5H50.5" />
            <path
              className="stroke-cream fill-none"
              d="M46 28.5h.1M50 28.5h.1"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
            <path
              className="inked fill-night stroke-coral"
              d="M48 8H62L59 11.5L62 15H48"
            />
          </g>
          <circle className={lantern} cx="48" cy="5" r="3" />
        </svg>
      );
    case QuestionBoatKind.AIRDROP:
      return (
        <svg className={styles.skiff} viewBox="0 0 96 88" aria-hidden>
          <path className="fill-night" d="M18 62H78L70 78H26Z" />
          <path
            className="inked stroke-cream"
            d="M18 62H78L70 78H26Z"
            fill={hatchFill(Hatch.HULL)}
          />
          <path className="pen stroke-cream" d="M48 62V9" />
          <g className={gear}>
            <path className="fill-night" d="M51 20V57H77Z" />
            <path
              className="inked stroke-lilac"
              d="M51 20V57H77Z"
              fill={hatchFill(Hatch.SAIL_LILAC)}
            />
            <path
              className="inked fill-night stroke-cream"
              d="M14 30A14 12 0 0 1 42 30Q37.3 26.5 32.7 30Q28 26.5 23.3 30Q18.7 26.5 14 30Z"
            />
            <path
              d="M28 18Q22 23 23.3 30Q18.7 26.5 14 30A14 12 0 0 1 28 18Z"
              fill={hatchFill(Hatch.CORAL)}
            />
            <path
              d="M28 18Q34 23 32.7 30Q37.3 26.5 42 30A14 12 0 0 0 28 18Z"
              fill={hatchFill(Hatch.CORAL)}
            />
            <path
              className="pen stroke-cream"
              d="M28 18Q22 23 23.3 30M28 18Q34 23 32.7 30"
            />
            <path
              className="pen stroke-cream"
              d="M14 30L24 44M42 30L32 44M23.3 30L26.5 44M32.7 30L29.5 44"
            />
            <path className="fill-night" d="M22 44H34V54H22Z" />
            <path
              className="inked stroke-cream"
              d="M22 44H34V54H22Z"
              fill={hatchFill(Hatch.WOOD)}
            />
          </g>
          <circle className={lantern} cx="48" cy="5" r="3" />
        </svg>
      );
    case QuestionBoatKind.COINS:
      return (
        <svg className={styles.skiff} viewBox="0 0 96 88" aria-hidden>
          <path className="fill-night" d="M18 62H78L70 78H26Z" />
          <path
            className="inked stroke-cream"
            d="M18 62H78L70 78H26Z"
            fill={hatchFill(Hatch.HULL)}
          />
          <path className="pen stroke-cream" d="M48 62V9" />
          <g className={gear}>
            <path className="fill-night" d="M51 20V57H77Z" />
            <path
              className="inked stroke-moon"
              d="M51 20V57H77Z"
              fill={hatchFill(Hatch.SAIL_MOON)}
            />
            <path
              className="inked fill-night stroke-moon"
              d="M48 10H59L56.5 13L59 16H48"
            />
            {COIN_PILE.map((coin) => (
              <GoldCoin
                key={`${coin.x}-${coin.y}`}
                x={coin.x}
                y={coin.y}
                radius={4}
              />
            ))}
            <path
              className="pen stroke-moon"
              d="M21 36v5M18.5 38.5h5M43 34v4M41 36h4"
            />
          </g>
          <circle className={lantern} cx="48" cy="5" r="3" />
        </svg>
      );
  }
}
