"use client";

import React, { useEffect, useRef, useState } from "react";

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

  const combinedClassName = `
    ${className || ""}
    transition-all duration-1000 ease-out
    ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}
  `.trim();

  return (
    <div ref={ref} className={combinedClassName}>
      {children}
    </div>
  );
}
