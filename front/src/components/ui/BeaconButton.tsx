import clsx from "clsx";
import { useState, type ReactNode } from "react";

interface BeaconButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  // greyed out but still clickable: a click plays the refusal
  isUnavailable?: boolean;
  isRaised?: boolean;
}

export default function BeaconButton({
  children,
  onClick,
  disabled,
  isUnavailable,
  isRaised,
}: BeaconButtonProps) {
  const [isRefusing, setIsRefusing] = useState(false);
  const isDimmed = disabled || isUnavailable;

  const handleClick = () => {
    if (isUnavailable) {
      setIsRefusing(true);
      return;
    }
    onClick?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onAnimationEnd={() => setIsRefusing(false)}
      disabled={disabled}
      aria-disabled={isUnavailable}
      className={clsx(
        "text-night text-action inline-flex min-h-14 items-center gap-3 rounded-full px-7.5 font-mono font-medium tracking-widest uppercase transition duration-150 ease-out",
        isDimmed
          ? "bg-ash cursor-default"
          : "bg-moon ring-moon-glow cursor-pointer",
        !isDimmed &&
          (isRaised
            ? "-translate-y-px ring-11"
            : "ring-6 hover:-translate-y-px hover:ring-11 active:translate-y-px active:ring-3"),
        isRefusing && "animate-refuse",
      )}
    >
      {children}
    </button>
  );
}
