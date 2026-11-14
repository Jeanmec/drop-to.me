"use client";

import NumberFlow from "@number-flow/react";
import clsx from "clsx";
import type { ReactNode } from "react";
import BarrelIcon from "@/components/Icons/BarrelIcon";
import BottleIcon from "@/components/Icons/BottleIcon";
import CrateIcon from "@/components/Icons/CrateIcon";
import SailboatIcon from "@/components/Icons/SailboatIcon";
import { useStatsStore } from "@/stores/useStatsStore";
import { splitFileSize } from "@/utils/file.utils";
import styles from "./Statistics.module.css";

const SIZE_SIGNIFICANT_DIGITS = 3;

interface StatisticItemProps {
  icon: ReactNode;
  title: string;
  value: number;
  suffix?: string;
}

function StatisticItem({ icon, title, value, suffix }: StatisticItemProps) {
  return (
    <div className={styles.stat}>
      <dt className={styles.statTerm}>
        <div className={styles.statIcon}>{icon}</div>
        <span
          className={clsx(
            styles.statLabel,
            "text-ash text-caption font-mono tracking-widest uppercase",
          )}
        >
          {title}
        </span>
      </dt>
      <dd
        className={clsx(styles.statValue, "text-tally font-light tabular-nums")}
      >
        <NumberFlow
          spinTiming={{ duration: 750 }}
          value={value}
          suffix={suffix}
        />
      </dd>
    </div>
  );
}

export default function Statistics() {
  const statistics = useStatsStore((state) => state.statistics);
  const size = splitFileSize(statistics.sizeTransferred);

  const statsData: StatisticItemProps[] = [
    {
      icon: <BarrelIcon className="size-8.5" />,
      title: "Data Transferred",
      value: Number(size.value.toPrecision(SIZE_SIGNIFICANT_DIGITS)),
      suffix: size.unit,
    },
    {
      icon: <SailboatIcon className="size-8.5" />,
      title: "Users",
      value: statistics.users,
    },
    {
      icon: <BottleIcon className="size-8.5" />,
      title: "Messages Sent",
      value: statistics.messagesSent,
    },
    {
      icon: <CrateIcon className="size-8.5" />,
      title: "Files Transferred",
      value: statistics.totalTransfers,
    },
  ];

  return (
    <section aria-label="Statistics">
      <dl className={styles.tally}>
        {statsData.map((stat) => (
          <StatisticItem
            key={stat.title}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
            suffix={stat.suffix}
          />
        ))}
      </dl>
    </section>
  );
}
