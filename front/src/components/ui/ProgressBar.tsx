import { cn } from "@/library/utils";

interface ProgressBarProps {
  value: number;
  label: string;
  className?: string;
}

export default function ProgressBar({
  value,
  label,
  className,
}: ProgressBarProps) {
  return (
    <span
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("bg-dim block h-0.75", className)}
    >
      <span className="bg-moon block h-full" style={{ width: `${value}%` }} />
    </span>
  );
}
