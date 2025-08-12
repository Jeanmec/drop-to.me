"use client";

import MagicBento, { BentoCard } from "../ui/MagicBento";
import useCSSVariable from "@/library/CSSVariable";
import { cn, hexToRgbObject } from "@/library/utils";
import BeamConnection from "@/components/Beam/BeamConnection";
import BeamTransfer from "@/components/Beam/BeamTransfer";
import { Icon } from "@/components/Icons/Icon";
import DivAppear from "@/components/ui/DivAppear";
import { Globe } from "@/components/ui/Globe";
import Ripple from "@/components/ui/Ripple";
import Sparkles from "@/components/ui/Sparkles";

type GlowingCardProps = {
  className?: string;
  children?: React.ReactNode;
  compact?: boolean;
};

const GlowingCard = ({ className, children, compact }: GlowingCardProps) => {
  return (
    <BentoCard className={compact ? "p-0" : "p-5"}>
      <div className={cn("flex h-full w-full", className)}>{children}</div>
    </BentoCard>
  );
};

const CardAppear = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <DivAppear
      once={true}
      className={cn(
        "border-primary-blue/50 hover:border-primary-blue flex h-full w-full flex-col rounded-xl border-2 transition-all duration-300",
        className,
      )}
    >
      {children}
    </DivAppear>
  );
};

const items = {
  beamConnection: (
    <>
      <p className="text-description text-center text-base">
        On connection, {process.env.NEXT_PUBLIC_WEBSITE_NAME} creates a secure
        peer-to-peer connection between devices on the same network.
      </p>
      <div className="my-auto flex w-full justify-center">
        <BeamConnection />
      </div>
    </>
  ),
  connectionRipple: (
    <>
      <div className="relative h-[250px] w-full overflow-hidden">
        <div className="relative flex h-full w-full items-center justify-center">
          <Ripple />
          <p className="absolute">
            <Icon.upload className="text-white" />
          </p>
        </div>
      </div>
      <p className="text-description my-5 px-5 text-center text-base">
        Once the connection is established, you can start sending and receiving
        data between devices.
      </p>
    </>
  ),
  globe: (
    <>
      <span className="custom-blue-shadow absolute top-2 left-2 rounded-md border-none bg-black px-2 py-1 text-sm text-white">
        Soon
      </span>

      <p className="text-description z-[2] rounded-xl p-1 text-center text-base backdrop-blur-xl">
        Create a direct connection with another users around the world
      </p>
      <Globe className="top-1/4 md:top-2/4" />
    </>
  ),
  transfer: (
    <>
      <p className="text-description text-base">
        {process.env.NEXT_PUBLIC_WEBSITE_NAME} allows you to transfer files and
        messages securely and efficiently to all connected users.
      </p>
      <div className="flex h-full w-full flex-1 items-center">
        <BeamTransfer />
      </div>
    </>
  ),
  openSource: (
    <a href={process.env.NEXT_PUBLIC_GITHUB_URL} target="_blank">
      <div className="absolute top-0 right-0 z-[1]">
        <Icon.github className="text-[200px] text-slate-950 opacity-0 drop-shadow-2xl transition-all duration-1000 group-hover:opacity-100" />
      </div>
      <p className="text-description relative z-[2] text-center text-base">
        A complete open-source project
      </p>
      <Sparkles
        density={80}
        speed={1.2}
        size={1.2}
        opacitySpeed={2}
        color="#32A7FF"
        className="absolute inset-x-0 bottom-0 h-full w-full opacity-0 transition-all duration-1000 md:group-hover:opacity-100"
      />
    </a>
  ),
};

export default function GlowingGrid() {
  const primaryBlue = useCSSVariable("--color-primary-blue");

  const primaryBlueRgb = primaryBlue ? hexToRgbObject(primaryBlue) : null;

  return (
    <div className="flex h-full w-full flex-col">
      <h2 className="mb-4 text-center md:text-left">How does it work?</h2>
      <div className="flex flex-col items-center gap-3 lg:hidden">
        <div className="gap-3 p-5">{items.beamConnection}</div>
        <div>{items.connectionRipple}</div>
        <div className="gap-3 p-5 text-center">{items.transfer}</div>
        <div className="relative flex h-[400px] items-center justify-center overflow-hidden">
          {items.globe}
        </div>
        <div className="flex h-[200px] items-center justify-center">
          {items.openSource}
        </div>
      </div>
      <div className="hidden lg:block">
        <MagicBento
          enableStars={false}
          enableSpotlight
          enableBorderGlow
          disableAnimations={false}
          enableTilt={false}
          clickEffect={false}
          enableMagnetism={false}
          spotlightRadius={500}
          glowColor={
            (primaryBlueRgb &&
              `${primaryBlueRgb.r}, ${primaryBlueRgb.g}, ${primaryBlueRgb.b}`) ??
            "255, 255, 255"
          }
        >
          <CardAppear className="col-span-6 row-span-3 h-full">
            <GlowingCard className="flex-col justify-center gap-3">
              {items.beamConnection}
            </GlowingCard>
          </CardAppear>

          <CardAppear className="col-span-6 row-span-4 h-full">
            <GlowingCard className="flex-col gap-3" compact={true}>
              {items.connectionRipple}
            </GlowingCard>
          </CardAppear>

          <CardAppear className="col-span-6 row-span-5 h-full">
            <GlowingCard className="items-center justify-center">
              {items.globe}
            </GlowingCard>
          </CardAppear>

          <CardAppear className="col-span-6 row-span-6 h-full">
            <GlowingCard className="flex-col items-center gap-2">
              {items.transfer}
            </GlowingCard>
          </CardAppear>

          <CardAppear className="col-span-6 row-span-2 h-full">
            <GlowingCard className="group flex-col justify-center gap-3">
              {items.openSource}
            </GlowingCard>
          </CardAppear>
        </MagicBento>
      </div>
    </div>
  );
}
