import { cn } from "@/library/utils";
import React, {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type RefObject,
} from "react";

type CircleProps = {
  className?: string;
  children?: React.ReactNode;
};

export const Circle = forwardRef<HTMLDivElement, CircleProps>(
  ({ className, children }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "z-[2] flex h-12 w-12 items-center justify-center rounded-full border-0 bg-slate-800 p-3 text-2xl shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
          className,
        )}
      >
        {children}
      </div>
    );
  },
);
Circle.displayName = "Circle";
export interface AnimatedBeamProps {
  containerRef: RefObject<HTMLElement | null>;
  fromRef: RefObject<HTMLElement | null>;
  toRef: RefObject<HTMLElement | null>;
  className?: string;
  curvature?: number;
  reverse?: boolean;
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  duration?: number;
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
  dotted?: boolean;
  dotSpacing?: number;
  beamLengthRatio?: number;
}

export default function AnimatedBeam({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = 2,
  pathColor = "gray",
  pathWidth = 2,
  pathOpacity = 0.2,
  gradientStartColor = "#4d40ff",
  gradientStopColor = "#4043ff",
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
  dotted = false,
  dotSpacing = 6,
  beamLengthRatio = 0.2,
}: AnimatedBeamProps) {
  const [pathD, setPathD] = useState("");
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });

  const pathRef = useRef<SVGPathElement>(null);
  const gradientRef = useRef<SVGLinearGradientElement>(null);
  const id = useId();

  useEffect(() => {
    const updatePath = () => {
      if (!containerRef.current || !fromRef.current || !toRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const rectA = fromRef.current.getBoundingClientRect();
      const rectB = toRef.current.getBoundingClientRect();

      const svgWidth = containerRect.width;
      const svgHeight = containerRect.height;
      setSvgDimensions({ width: svgWidth, height: svgHeight });

      const startX =
        rectA.left - containerRect.left + rectA.width / 2 + startXOffset;
      const startY =
        rectA.top - containerRect.top + rectA.height / 2 + startYOffset;
      const endX =
        rectB.left - containerRect.left + rectB.width / 2 + endXOffset;
      const endY =
        rectB.top - containerRect.top + rectB.height / 2 + endYOffset;

      const controlY = startY - curvature;
      const d = `M ${startX},${startY} Q ${
        (startX + endX) / 2
      },${controlY} ${endX},${endY}`;
      setPathD(d);
    };

    const resizeObserver = new ResizeObserver(updatePath);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    updatePath();
    return () => resizeObserver.disconnect();
  }, [
    containerRef,
    fromRef,
    toRef,
    curvature,
    startXOffset,
    startYOffset,
    endXOffset,
    endYOffset,
  ]);

  useEffect(() => {
    const pathEl = pathRef.current;
    const gradientEl = gradientRef.current;
    if (!pathEl || !gradientEl || !pathD) return;

    const totalLength = pathEl.getTotalLength();
    const beamLength = totalLength * beamLengthRatio;

    pathEl.style.strokeDasharray = `${beamLength} ${totalLength}`;

    let startTime: number | null = null;
    const durationMs = duration * 1000;

    const clamp = (num: number, min: number, max: number) =>
      Math.min(Math.max(num, min), max);

    const animate = (timestamp: number) => {
      startTime ??= timestamp;
      const elapsed = (timestamp - startTime) % durationMs;
      const progress = elapsed / durationMs;

      const forwardOffset = beamLength - progress * (totalLength + beamLength);
      const reverseOffset =
        -totalLength + progress * (totalLength + beamLength);

      const currentOffset = reverse ? reverseOffset : forwardOffset;

      pathEl.style.strokeDashoffset = `${currentOffset}`;

      const beamStartPos = -currentOffset;
      const beamEndPos = beamStartPos + beamLength;

      const startPoint = pathEl.getPointAtLength(
        clamp(beamStartPos, 0, totalLength),
      );
      const endPoint = pathEl.getPointAtLength(
        clamp(beamEndPos, 0, totalLength),
      );

      gradientEl.setAttribute("x1", `${startPoint.x}`);
      gradientEl.setAttribute("y1", `${startPoint.y}`);
      gradientEl.setAttribute("x2", `${endPoint.x}`);
      gradientEl.setAttribute("y2", `${endPoint.y}`);

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [pathD, duration, beamLengthRatio, reverse]);

  const strokeDasharray = dotted ? `${dotSpacing} ${dotSpacing}` : "none";

  return (
    <svg
      fill="none"
      width={svgDimensions.width}
      height={svgDimensions.height}
      viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
      className={cn("pointer-events-none absolute top-0 left-0", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={pathD}
        stroke={pathColor}
        strokeWidth={pathWidth}
        strokeOpacity={pathOpacity}
        strokeLinecap="round"
        strokeDasharray={strokeDasharray}
      />
      <path
        ref={pathRef}
        d={pathD}
        stroke={`url(#gradient-${id})`}
        strokeWidth={pathWidth}
        strokeLinecap="round"
      />
      <defs>
        <linearGradient
          id={`gradient-${id}`}
          ref={gradientRef}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={gradientStartColor} stopOpacity={1}></stop>
          <stop
            offset="100%"
            stopColor={gradientStopColor}
            stopOpacity={1}
          ></stop>
        </linearGradient>
      </defs>
    </svg>
  );
}
