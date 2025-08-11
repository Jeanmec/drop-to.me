"use client";

import React, { useRef } from "react";
import AnimatedBeam, { Circle } from "@/components/ui/AnimatedBeam";

import { Icon } from "@/components/Icons/Icon";
import AnimatedBorder from "@/components/ui/AnimatedBorder";
import { cn } from "@/library/utils";
export default function BeamTransfer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const usersRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="bg-background relative mx-auto flex h-full w-full max-w-[32rem] items-center justify-center overflow-hidden rounded-lg p-10 md:shadow-xl"
      ref={containerRef}
    >
      <div className="flex h-full w-full flex-col items-center justify-between gap-24">
        <div className="flex w-full justify-between sm:justify-center sm:gap-12">
          <Circle ref={imageRef} className="hidden sm:block">
            <Icon.image />
          </Circle>
          <Circle ref={messageRef}>
            <Icon.message />
          </Circle>
          <Circle ref={videoRef}>
            <Icon.video />
          </Circle>
          <Circle ref={pdfRef} className="hidden sm:block">
            <Icon.pdf />
          </Circle>
        </div>

        <div className="flex flex-col justify-center">
          <Circle ref={userRef} className="custom-blue-shadow h-16 w-16">
            <Icon.user />
          </Circle>
        </div>
        <AnimatedBorder className="flex w-full items-center justify-center rounded-2xl px-2 py-6 sm:px-4 md:px-6">
          <div ref={usersRef} className="w-full">
            <div className="-ml-2 flex w-full justify-center -space-x-4 md:ml-0">
              {Array.from({ length: 9 }).map((_, idx) => (
                <UserAvatar
                  key={idx}
                  className={
                    idx >= 5
                      ? idx < 8
                        ? "hidden sm:flex"
                        : "hidden md:flex"
                      : "flex"
                  }
                />
              ))}
            </div>
          </div>
        </AnimatedBorder>
      </div>
      <AnimatedBeam
        className="hidden sm:block"
        containerRef={containerRef}
        fromRef={imageRef}
        toRef={userRef}
        curvature={-180}
        gradientStartColor="#004cff"
        gradientStopColor="#119cff"
        dotted
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={messageRef}
        toRef={userRef}
        dotted
        gradientStartColor="#ff00cc"
        gradientStopColor="#4800ff"
        curvature={-200}
        endYOffset={0}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={videoRef}
        toRef={userRef}
        dotted
        gradientStartColor="#ff9900"
        gradientStopColor="#ff0000"
        curvature={-200}
      />
      <AnimatedBeam
        className="hidden sm:block"
        containerRef={containerRef}
        fromRef={pdfRef}
        toRef={userRef}
        dotted
        gradientStartColor="#00ff44"
        gradientStopColor="#fbff00"
        curvature={-175}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={userRef}
        toRef={usersRef}
        gradientStartColor="#ffffff"
        gradientStopColor="#00ffcc"
        endYOffset={-50}
        beamLengthRatio={0.3}
        dotted
      />
    </div>
  );
}

const UserAvatar = ({ className }: { className?: string }) => {
  return (
    <Icon.user
      className={cn(
        "-ml-2- border-primary-blue flex h-10 w-10 items-center justify-center rounded-full border-2 bg-black p-2 text-sm",
        className,
      )}
    />
  );
};
