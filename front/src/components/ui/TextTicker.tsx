import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";

export default function TextTicker({
  value,
  direction = "up",
  duration = 4,
}: {
  value: number;
  direction?: "up" | "down";
  duration?: number;
}) {
  const motionValue = useMotionValue(direction === "down" ? value : 0);
  const animationRef = useRef<ReturnType<typeof animate> | null>(null);

  useEffect(() => {
    animationRef.current?.stop();

    animationRef.current = animate(
      motionValue,
      direction === "down" ? 0 : value,
      {
        duration,
        ease: "easeOut",
      },
    );

    return () => animationRef.current?.stop();
  }, [value, direction, duration, motionValue]);

  const displayValue = useTransform(motionValue, (latest) =>
    Intl.NumberFormat("en-US").format(Math.round(latest)),
  );

  return <motion.span>{displayValue}</motion.span>;
}
