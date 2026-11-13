interface ChestIconProps {
  className?: string;
}

export default function ChestIcon({ className }: ChestIconProps) {
  return (
    <svg className={className} viewBox="0 0 26 26" aria-hidden>
      <path
        className="pen stroke-cream"
        d="M3 11H23V22H3ZM3 11V9Q13 2 23 9V11M8 5.8V22M18 5.8V22"
      />
      <path className="pen stroke-moon" d="M11 11h4v4.5h-4z" />
    </svg>
  );
}
