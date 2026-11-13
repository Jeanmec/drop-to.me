interface BottleIconProps {
  className?: string;
}

export default function BottleIcon({ className }: BottleIconProps) {
  return (
    <svg className={className} viewBox="0 0 34 34" aria-hidden>
      <g transform="rotate(-32 17 16)">
        <path
          className="pen stroke-cream"
          d="M12 12Q12 8.5 15 7.5V3H19V7.5Q22 8.5 22 12V26Q22 28 20 28H14Q12 28 12 26Z"
        />
        <path className="pen stroke-moon" d="M15 3H19" />
        <path className="pen stroke-ash" d="M15 13V21" />
      </g>
      <path className="pen stroke-horizon" d="M3 30.5q3.5-3 7 0t7 0t7 0t7 0" />
    </svg>
  );
}
