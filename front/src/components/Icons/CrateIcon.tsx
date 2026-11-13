interface CrateIconProps {
  className?: string;
}

export default function CrateIcon({ className }: CrateIconProps) {
  return (
    <svg className={className} viewBox="0 0 34 34" aria-hidden>
      <path
        className="pen stroke-cream"
        d="M4 13H24V30H4ZM4 13L10 7H30L24 13M30 7V24L24 30"
      />
      <path
        className="pen stroke-cream"
        d="M4 18.7H24M4 24.3H24M24 18.7L30 12.7M24 24.3L30 18.3"
      />
      <path className="pen stroke-moon" d="M8 13V30M20 13V30M14 13L20 7" />
    </svg>
  );
}
