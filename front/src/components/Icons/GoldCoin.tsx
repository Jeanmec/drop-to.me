import { Hatch } from "@/types/scene.t";
import { hatchFill } from "@/utils/hatch.utils";

interface GoldCoinProps {
  x: number;
  y: number;
  radius: number;
}

export default function GoldCoin({ x, y, radius }: GoldCoinProps) {
  return (
    <>
      <circle className="fill-night" cx={x} cy={y} r={radius} />
      <circle
        className="inked stroke-moon"
        cx={x}
        cy={y}
        r={radius}
        fill={hatchFill(Hatch.GOLD)}
      />
    </>
  );
}
