import clsx from "clsx";
import SectionHeading from "@/components/ui/SectionHeading";
import { env } from "@/env";
import { Hatch } from "@/types/scene.t";
import { hatchFill } from "@/utils/hatch.utils";
import styles from "./VoyageChart.module.css";

const ROSE_POINTS = [0, 1, 2, 3, 4, 5, 6, 7];

const STEPS = [
  `On connection, ${env.NEXT_PUBLIC_WEBSITE_NAME} creates a secure, encrypted connection between devices on the same network.`,
  "Once the connection is established, you can start sending and receiving data between devices.",
  `${env.NEXT_PUBLIC_WEBSITE_NAME} allows you to transfer files and messages securely and efficiently to all connected users.`,
];

export default function VoyageChart() {
  return (
    <section>
      <SectionHeading className="mb-5.5">How does it work?</SectionHeading>
      <div className={styles.sheet}>
        <div className={styles.rose} aria-hidden>
          <svg className={styles.roseLayer} viewBox="-66 -66 132 132">
            <circle className="pen stroke-ash opacity-50" r="58" />
            <circle className="pen stroke-ash opacity-50" r="38" />
            <text className={styles.north} y="-56" dy="-2">
              N
            </text>
          </svg>
          <div className={styles.needle}>
            <svg className={styles.roseLayer} viewBox="-66 -66 132 132">
              {ROSE_POINTS.map((point) => {
                const reach = point % 2 ? 30 : 52;
                return (
                  <g key={point} transform={`rotate(${point * 45})`}>
                    <path
                      className="pen stroke-ash"
                      d={`M0 ${-reach}L7 -7L0 0L-7 -7Z`}
                    />
                    <path
                      d={`M0 ${-reach}L7 -7L0 0Z`}
                      fill={hatchFill(Hatch.ROSE)}
                    />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        <div className={clsx(styles.end, "text-ash text-caption font-mono")}>
          <svg className={styles.endIcon} viewBox="0 0 44 44" aria-hidden>
            <path
              className="pen stroke-cream"
              d="M17 40L19 16H25L27 40ZM16 16H28M18 16V10H26V16M18 10L22 4L26 10M12 40H32"
            />
            <path
              className="pen stroke-moon"
              d="M30 12L38 9M30 14L38 15M14 12L6 9M14 14L6 15"
            />
          </svg>
          <span>This device</span>
        </div>

        <div className={styles.track}>
          <span className={styles.wake} aria-hidden />
          <span className={styles.voyager} aria-hidden>
            <svg className={styles.voyagerBoat} viewBox="0 0 44 44">
              <path
                className="inked fill-night stroke-cream"
                d="M6 30H38L33 38H11Z"
              />
              <path className="pen stroke-cream" d="M22 30V6" />
              <path className="inked fill-night stroke-moon" d="M24 9V27H36Z" />
              <path
                className="inked fill-night stroke-blush"
                d="M20 12V27H10Z"
              />
            </svg>
          </span>
          <ol className={styles.course}>
            {STEPS.map((step, index) => (
              <li key={step} className={styles.step}>
                <span
                  className={clsx(styles.buoy, "text-xl font-semibold italic")}
                  aria-hidden
                >
                  {index + 1}
                </span>
                <p className={clsx(styles.stepText, "text-lg")}>{step}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className={clsx(styles.end, "text-ash text-caption font-mono")}>
          <svg className={styles.endIcon} viewBox="0 0 44 44" aria-hidden>
            <path
              className="pen stroke-cream"
              d="M6 30H38L33 38H11ZM22 30V6M24 9V27H36Z"
            />
            <path className="pen stroke-blush" d="M20 12V27H10Z" />
          </svg>
          <span>Device on your network</span>
        </div>
      </div>
    </section>
  );
}
