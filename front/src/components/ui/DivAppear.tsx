"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/library/utils";

type DivAppearProps = {
  className?: string;
  children?: React.ReactNode;
  once?: boolean;
};

export default function DivAppear({
  className,
  children,
  once = true,
}: DivAppearProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(element);
          }
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [once]);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-1000 ease-out",

        isVisible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",

        className,
      )}
    >
      {children}
    </div>
  );
}
