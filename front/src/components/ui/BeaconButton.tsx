import type { ReactNode } from "react";
import { cn } from "@/library/utils";

interface BeaconButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  isRaised?: boolean;
}

export default function BeaconButton({
  children,
  onClick,
  disabled,
  isRaised,
}: BeaconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "bg-moon text-night ring-moon-glow text-action disabled:bg-ash inline-flex min-h-14 cursor-pointer items-center gap-3 rounded-full px-7.5 font-mono font-medium tracking-widest uppercase ring-6 transition duration-150 ease-out hover:-translate-y-px hover:ring-11 active:translate-y-px active:ring-3 disabled:translate-none disabled:cursor-default disabled:ring-0",
        isRaised && "-translate-y-px ring-11",
      )}
    >
      {children}
    </button>
  );
}
