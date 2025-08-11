"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/library/utils";
import React from "react";
import GlassSurface from "@/components/ui/Glass";

export type DockItemData = {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
};

type DockProps = {
  items: DockItemData[];
};

export default function Dock({ items }: DockProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    if (!isMobile) {
      const observer = new IntersectionObserver(
        ([entry]) => setIsSticky(entry ? !entry.isIntersecting : false),
        { threshold: 0 },
      );
      const currentSentinel = sentinelRef.current;
      if (currentSentinel) observer.observe(currentSentinel);

      return () => {
        if (currentSentinel) observer.unobserve(currentSentinel);
        window.removeEventListener("resize", handleResize);
      };
    }

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobile]);

  return (
    <>
      {!isMobile && (
        <div
          ref={sentinelRef}
          id="dock-sentinel"
          className="pointer-events-none absolute bottom-[150px] h-[1px] w-full"
        />
      )}

      <div
        className={cn(
          "bottom-2 left-1/2 z-10 flex h-[100px] w-fit -translate-x-1/2 justify-center pb-4",
          isMobile ? "fixed" : isSticky ? "fixed md:top-6" : "absolute",
        )}
      >
        <div
          className={cn(
            "relative flex h-full w-[400px] items-end",
            isSticky ? "items-start" : "items-end",
          )}
        >
          <GlassSurface
            width={"100%"}
            borderRadius={999}
            height={50}
            redOffset={0}
            className="absolute bottom-0 left-0 z-0 w-full"
          />

          <div className="absolute top-1/2 left-0 z-10 flex h-8/12 w-full -translate-y-1/2 items-center justify-evenly gap-8 sm:px-8 md:px-16">
            {items.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "tooltip cursor-pointer transition-transform duration-200 hover:scale-120",
                  !isMobile && isSticky ? "tooltip-bottom" : "tooltip-top",
                )}
                onClick={item.onClick}
                data-tip={item.label}
              >
                <GlassSurface
                  displace={3}
                  height={60}
                  width={75}
                  borderRadius={999}
                  borderWidth={0}
                >
                  <span className="[&>svg]:text-3xl">{item.icon}</span>
                </GlassSurface>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
