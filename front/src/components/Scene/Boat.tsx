import { cn } from "@/library/utils";
import type { TDevice } from "@/types/peer.t";
import type { TBerth, TBoatSignal } from "@/types/scene.t";
import BoatRig from "./BoatRig";
import { berthClass } from "./berthClass";
import styles from "./Fleet.module.css";

interface BoatProps {
  berth: TBerth;
  device: TDevice | undefined;
  isMoored: boolean;
  isReachable: boolean;
  signal: TBoatSignal;
  progress: number;
  onReceivedShown: () => void;
}

const clothStroke = (berth: TBerth): string => {
  switch (berth) {
    case "west":
      return "stroke-blush";
    case "east":
      return "stroke-lilac";
    case "cove":
      return "stroke-moon";
  }
};

const describeLink = (
  device: TDevice | undefined,
  isReachable: boolean,
): string => {
  if (!isReachable) {
    return "Connecting...";
  }
  if (!device) {
    return "Connected";
  }
  return [device.browser, device.system].filter(Boolean).join(" · ");
};

export default function Boat({
  berth,
  device,
  isMoored,
  isReachable,
  signal,
  progress,
  onReceivedShown,
}: BoatProps) {
  return (
    <li
      className={cn(styles.boat, berthClass(berth), isMoored && styles.moored)}
    >
      <BoatRig berth={berth} />
      <div className={styles.masthead}>
        <svg className={styles.lamp} viewBox="-12 -12 24 24" aria-hidden>
          <circle className="fill-moon" r="4" />
          <path className="pen stroke-moon" d="M0 -10V-7M-8 0H-11M8 0H11" />
        </svg>
        <div className={styles.flag}>
          <svg
            className={styles.cloth}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              className={cn("inked fill-night", clothStroke(berth))}
              vectorEffect="non-scaling-stroke"
              d="M0 0H100L90 50L100 100H0"
            />
          </svg>
          <b
            className={cn(
              styles.name,
              "text-sm leading-tight font-semibold italic max-md:text-xs",
            )}
          >
            {device?.name ?? "Device"}
          </b>
          <span
            className={cn(
              styles.line,
              signal !== "idle" && styles.furled,
              "text-ash text-micro font-mono leading-snug",
            )}
          >
            {describeLink(device, isReachable)}
          </span>
          <span
            className={cn(
              styles.line,
              styles.signal,
              signal === "receiving" && styles.hoisted,
              "text-moon text-micro font-mono leading-snug",
            )}
          >
            Receiving{" "}
            <em className={cn(styles.percent, "not-italic")}>{progress}%</em>
          </span>
          <span
            className={cn(
              styles.line,
              styles.signal,
              signal === "received" && styles.hoisted,
              signal === "received" && styles.acknowledged,
              "text-moon text-micro font-mono leading-snug",
            )}
            onAnimationEnd={onReceivedShown}
          >
            Received
          </span>
        </div>
      </div>
    </li>
  );
}
