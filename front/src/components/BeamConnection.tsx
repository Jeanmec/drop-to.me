"use client";

import React, { useRef } from "react";
import { AnimatedBeam, Circle } from "@/components/ui/animated-beam";
import { FiUser } from "react-icons/fi";
import useCSSVariable from "@/library/CSSVariable";
import Connection from "./Icons/Connection";
import ShineBorder from "./ui/shine-border";

export default function BeamConnection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);

  const primaryBlue = useCSSVariable("--color-primary-blue");
  const secondaryBlue = useCSSVariable("--color-secondary-blue");

  return (
    <div
      className="bg-background relative flex w-full max-w-[500px] items-center justify-center overflow-hidden rounded-lg p-2 md:shadow-xl"
      ref={containerRef}
    >
      <div className="flex h-full w-full flex-col items-stretch justify-between gap-10">
        <div className="flex flex-row justify-between">
          <Circle ref={div1Ref}>
            <FiUser />
          </Circle>
          <Circle
            className="custom-blue-shadow text-secondary-blue p-2"
            ref={div3Ref}
          >
            <Connection />
          </Circle>
          <Circle className="p-2" ref={div2Ref}>
            <FiUser />
          </Circle>
        </div>
      </div>

      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div3Ref}
        gradientStartColor={primaryBlue}
        gradientStopColor={secondaryBlue}
        duration={1.5}
        delay={0}
        dotted
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div2Ref}
        toRef={div3Ref}
        gradientStartColor={primaryBlue}
        gradientStopColor={secondaryBlue}
        duration={1.5}
        delay={1}
        dotted
        reverse
      />
    </div>
  );
}
