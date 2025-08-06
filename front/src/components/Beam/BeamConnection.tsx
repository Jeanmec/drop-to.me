"use client";

import React, { useRef } from "react";
import AnimatedBeam, { Circle } from "@/components/ui/animated-beam";
import useCSSVariable from "@/library/CSSVariable";
import { Icon } from "@/components/Icons/Icon";

export default function BeamConnection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const user1Ref = useRef<HTMLDivElement>(null);
  const user2Ref = useRef<HTMLDivElement>(null);
  const connectionRef = useRef<HTMLDivElement>(null);

  const primaryBlue = useCSSVariable("--color-primary-blue");
  const secondaryBlue = useCSSVariable("--color-secondary-blue");

  return (
    <div
      className="bg-background relative flex w-full max-w-[500px] items-center justify-center overflow-hidden rounded-lg p-2 md:shadow-xl"
      ref={containerRef}
    >
      <div className="flex h-full w-full flex-col items-stretch justify-between gap-10">
        <div className="flex flex-row justify-between">
          <Circle ref={user1Ref}>
            <Icon.user className="text-white" />
          </Circle>
          <Circle
            className="custom-blue-shadow text-secondary-blue p-2"
            ref={connectionRef}
          >
            <Icon.connect />
          </Circle>
          <Circle className="p-2" ref={user2Ref}>
            <Icon.user className="text-white" />
          </Circle>
        </div>
      </div>

      <AnimatedBeam
        containerRef={containerRef}
        fromRef={user1Ref}
        toRef={connectionRef}
        gradientStartColor={primaryBlue}
        gradientStopColor={secondaryBlue}
        dotted
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={user2Ref}
        toRef={connectionRef}
        gradientStartColor={primaryBlue}
        gradientStopColor={secondaryBlue}
        dotted
      />
    </div>
  );
}
