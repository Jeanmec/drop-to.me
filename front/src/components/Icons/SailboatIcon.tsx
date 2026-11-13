interface SailboatIconProps {
  className?: string;
}

export default function SailboatIcon({ className }: SailboatIconProps) {
  return (
    <svg className={className} viewBox="0 0 34 34" aria-hidden>
      <path className="pen stroke-cream" d="M5 24H29L25 30H9ZM17 24V4" />
      <path className="pen stroke-blush" d="M19 7V21H28Z" />
      <path className="pen stroke-lilac" d="M15 10V21H8Z" />
    </svg>
  );
}
