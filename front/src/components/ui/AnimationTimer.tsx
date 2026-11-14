import clsx from "clsx";

interface AnimationTimerProps {
  className: string;
  onElapsed: () => void;
}

export default function AnimationTimer({
  className,
  onElapsed,
}: AnimationTimerProps) {
  return (
    <i
      className={clsx("absolute", className)}
      onAnimationEnd={onElapsed}
      aria-hidden
    />
  );
}
