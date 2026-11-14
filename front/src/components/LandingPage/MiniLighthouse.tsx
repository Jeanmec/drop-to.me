import { Hatch } from "@/types/scene.t";
import { hatchFill } from "@/utils/hatch.utils";

interface MiniLighthouseProps {
  className?: string;
}

export default function MiniLighthouse({ className }: MiniLighthouseProps) {
  return (
    <svg className={className} viewBox="0 0 64 150" aria-hidden>
      <path
        className="inked fill-night stroke-cream"
        d="M21 150L27 40H37L43 150Z"
      />
      <path d="M22.6 120H41.4L40 96H24Z" fill={hatchFill(Hatch.CORAL)} />
      <path d="M25.4 70H38.6L37 40H27Z" fill={hatchFill(Hatch.CORAL)} />
      <path className="pen stroke-cream" d="M22 40H42" />
      <rect
        className="inked fill-night stroke-cream"
        x="26"
        y="14"
        width="12"
        height="26"
      />
      <circle className="fill-moon" cx="32" cy="24" r="4" />
      <path className="fill-night" d="M22 14H42L32 3Z" />
      <path
        className="inked stroke-coral"
        d="M22 14H42L32 3Z"
        fill={hatchFill(Hatch.CORAL)}
      />
    </svg>
  );
}
