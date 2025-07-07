"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useCSSVariable from "@/library/CSSVariable";

export const BackgroundCircle = () => {
  const spacing = 70;
  const radii = Array.from({ length: 20 }, (_, i) => (i + 1) * spacing);

  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const [mouse, setMouse] = useState<{ x: number; y: number }>({
    x: -9999,
    y: -9999,
  });

  const primaryBlue = useCSSVariable("--color-primary-blue");

  useEffect(() => {
    const updateSize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    window.addEventListener("mousemove", handleMouseMove);

    function handleMouseMove(e: MouseEvent) {
      setMouse({
        x: e.clientX,
        y: e.clientY,
      });
    }

    return () => {
      window.removeEventListener("resize", updateSize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  if (!dimensions) return null;

  const { width, height } = dimensions;
  const centerX = width / 2;
  const centerY = height * 0.675;

  const delay = process.env.NEXT_PUBLIC_LOADING_SCREEN_DURATION
    ? Number(process.env.NEXT_PUBLIC_LOADING_SCREEN_DURATION) / 1000
    : 3;

  let activeIndex = -1;
  const dx = mouse.x - centerX;
  const dy = mouse.y - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  radii.forEach((r, idx) => {
    const prevR: number = idx === 0 ? 0 : (radii[idx - 1] ?? 0);
    if (distance <= r && distance >= prevR) {
      activeIndex = idx;
    }
  });

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-gradient-to-t from-black to-stone-800">
      <svg
        className="h-full w-full"
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <g>
          {radii.map((r, idx) => {
            let strokeColor = "rgba(255,255,255,0.2)";

            if (primaryBlue && activeIndex >= 0) {
              if (idx === activeIndex) {
                strokeColor = primaryBlue;
              } else if (idx < activeIndex) {
                const t = (activeIndex - idx) / activeIndex;
                const opacity = 0.5 * (1 - t) + 0.1;
                const hexAlpha = Math.round(opacity * 255)
                  .toString(16)
                  .padStart(2, "0");
                strokeColor = `${primaryBlue}${opacity < 1 ? hexAlpha : ""}`;
              }
            }

            return (
              <motion.circle
                key={r}
                cx={centerX}
                cy={centerY}
                r={r}
                initial={{
                  opacity: 0,
                  stroke: "rgba(255,255,255,0.2)",
                }}
                animate={{
                  opacity: 1,
                  stroke: strokeColor,
                }}
                transition={{
                  stroke: { duration: 0.5 },
                  opacity: {
                    delay: delay + idx * 0.1,
                    duration: 0.1,
                  },
                }}
                strokeWidth="2"
                fill="none"
              />
            );
          })}
        </g>
      </svg>
      <div
        className="absolute bottom-0 h-24 w-full backdrop-blur-3xl"
        style={{
          maskImage: "linear-gradient(to top, black 0%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to top, black 0%, transparent 100%)",
        }}
      />
    </div>
  );
};
