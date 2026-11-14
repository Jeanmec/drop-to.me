import clsx from "clsx";
import type { ReactNode } from "react";

interface SectionHeadingProps {
  children: ReactNode;
  className?: string;
}

export default function SectionHeading({
  children,
  className,
}: SectionHeadingProps) {
  return (
    <h2
      className={clsx(
        "text-moon font-mono text-xs tracking-widest uppercase",
        className,
      )}
    >
      {children}
    </h2>
  );
}
