"use client";
import React from "react";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";
import { useTabStore } from "@/stores/useTabStore";

export default function RadarBackground() {
  return (
    <div className="animate-fade-in pointer-events-none absolute inset-0 z-0 overflow-hidden bg-gradient-to-t from-black to-stone-800">
      <Radar className="absolute -bottom-12 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 z-[1] h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
    </div>
  );
}

export const Radar = ({ className }: { className: string }) => {
  const circles = new Array(8).fill(1);
  return (
    <div
      className={twMerge(
        "relative flex h-20 w-20 items-center justify-center rounded-full",
        className,
      )}
    >
      <div
        style={{
          transformOrigin: "right center",
        }}
        className="animate-radar-spin absolute top-1/2 right-1/2 z-[2] flex h-[5px] w-[400px] items-end justify-center overflow-hidden bg-transparent"
      >
        <div className="via-primary-blue relative z-[1] h-[2px] w-full bg-gradient-to-r from-transparent to-transparent" />
      </div>
      {circles.map((_, idx) => (
        <Circle
          style={{
            height: `${(idx + 1) * 5}rem`,
            width: `${(idx + 1) * 5}rem`,
            border: `1px solid rgba(70, 85, 100, ${1 - (idx + 1) * 0.1})`,
          }}
          key={`motion-${idx}`}
          idx={idx}
        />
      ))}
    </div>
  );
};

type CircleProps = React.ComponentProps<typeof motion.div> & { idx: number };

export const Circle = ({ idx, ...rest }: CircleProps) => {
  const delay = useTabStore((state) => state.delay);
  return (
    <motion.div
      {...rest}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        delay: delay + idx * 0.1,
        duration: 0.2,
      }}
      className="absolute inset-0 top-1/2 left-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 transform rounded-full border border-neutral-200"
    />
  );
};
