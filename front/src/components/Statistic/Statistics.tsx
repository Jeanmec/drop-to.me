"use client";

import { useEffect, type ReactNode } from "react";
import { useStatsStore } from "@/stores/useStatsStore";
import { statService } from "@/services/statService";
import { useSocket } from "@/contexts/SocketProvider";
import NumberFlow from "@number-flow/react";
import BarrelIcon from "@/components/Icons/BarrelIcon";
import BottleIcon from "@/components/Icons/BottleIcon";
import CrateIcon from "@/components/Icons/CrateIcon";
import SailboatIcon from "@/components/Icons/SailboatIcon";
import { cn } from "@/library/utils";
import styles from "./Statistics.module.css";

interface StatisticItemProps {
  icon: ReactNode;
  title: string;
  value: number;
  suffix?: string;
}

function StatisticItem({ icon, title, value, suffix }: StatisticItemProps) {
  return (
    <div className={styles.stat}>
      <div className={styles.statIcon}>{icon}</div>
      <dt
        className={cn(
          styles.statLabel,
          "text-ash text-caption font-mono tracking-widest uppercase",
        )}
      >
        {title}
      </dt>
      <dd
        className={cn(styles.statValue, "text-tally font-light tabular-nums")}
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
  const { statistics, setStatistics } = useStatsStore();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const loadStatistics = async () => {
      try {
        const stats = await statService.fetchStatistics();
        setStatistics(stats);
      } catch (error) {
        console.error("Failed to fetch statistics:", error);
      }
    };
    void loadStatistics();
  }, [socket, setStatistics]);

  const { value: sizeValue, suffix: sizeSuffix } = statService.formatSize(
    statistics.sizeTransferred,
  );

  const statsData: StatisticItemProps[] = [
    {
      icon: <BarrelIcon className="size-8.5" />,
      title: "Data Transferred",
      value: sizeValue,
      suffix: sizeSuffix,
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
