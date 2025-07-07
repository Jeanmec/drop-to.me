"use client";

import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/library/utils";
import BeamConnection from "@/components/BeamConnection";

export default function GlowingEffectDemoSecond() {
  return (
    <div className="flex h-[500px] flex-row gap-4 px-8">
      <div className="w-1/2">
        <GlowingItem>
          <span>salut</span>
        </GlowingItem>
      </div>
      <div className="flex h-full w-1/2 flex-col gap-4">
        <div className="h-full">
          <GlowingItem>
            <div>
              <BeamConnection />
            </div>
          </GlowingItem>
        </div>
        <div className="h-full">
          <GlowingItem>
            <span>salut</span>
          </GlowingItem>
        </div>
      </div>
    </div>
  );
}

const GlowingItem = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative h-full w-full rounded-2xl p-2 md:rounded-3xl md:p-3",
        className,
      )}
    >
      <GlowingEffect
        blur={0}
        borderWidth={3}
        spread={80}
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
      />
      <div className="border-0.75 relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6 dark:shadow-[0px_0px_27px_0px_#2D2D2D]">
        {children}
      </div>
    </div>
  );
};
