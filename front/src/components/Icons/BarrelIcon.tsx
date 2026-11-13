interface BarrelIconProps {
  className?: string;
}

export default function BarrelIcon({ className }: BarrelIconProps) {
  return (
    <svg className={className} viewBox="0 0 34 34" aria-hidden>
      <path
        className="pen stroke-cream"
        d="M10 6H24Q29.5 17 24 28H10Q4.5 17 10 6Z"
      />
      <path
        className="pen stroke-ash"
        d="M13 6.5Q10.5 17 13 27.5M21 6.5Q23.5 17 21 27.5M17 6V28"
      />
      <path className="pen stroke-moon" d="M7.7 11.5H26.3M7.7 22.5H26.3" />
    </svg>
  );
}
