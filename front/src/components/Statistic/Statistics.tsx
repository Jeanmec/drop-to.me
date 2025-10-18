"use client";

import { useEffect, type ReactNode } from "react";
import { useStatsStore } from "@/stores/useStatsStore";
import { statService } from "@/services/statService";
import { useSocket } from "@/contexts/SocketProvider";
import NumberFlow from "@number-flow/react";
import { Icon } from "@/components/Icons/Icon";

interface StatisticItemProps {
  icon: ReactNode;
  title: string;
  value: number;
  suffix?: string;
}

function StatisticItem({ icon, title, value, suffix }: StatisticItemProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4 sm:flex-row">
      <div className="[&>svg]:text-primary-blue text-3xl">{icon}</div>
      <div className="flex flex-col items-center sm:items-start">
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className="font-plus-jakarta-sans w-24 text-center text-3xl font-bold text-white sm:text-left">
          <NumberFlow
            spinTiming={{ duration: 750 }}
            value={value}
            suffix={suffix}
          />
        </div>
      </div>
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
      icon: <Icon.database />,
      title: "Data Transferred",
      value: sizeValue,
      suffix: sizeSuffix,
    },
    { icon: <Icon.user />, title: "Users", value: statistics.users },
    {
      icon: <Icon.message />,
      title: "Messages Sent",
      value: statistics.messagesSent,
    },
    {
      icon: <Icon.exchange />,
      title: "Files Transferred",
      value: statistics.totalTransfers,
    },
  ];

  return (
    <div className="w-full px-4 py-5">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-y-0 lg:divide-dashed lg:divide-slate-400">
        {statsData.map((stat) => (
          <StatisticItem
            key={stat.title}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
            suffix={stat.suffix}
          />
        ))}
      </div>
    </div>
  );
}
