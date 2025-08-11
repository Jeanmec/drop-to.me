"use client";

import { useContext, useEffect, useState, type ReactNode } from "react";
import { statService } from "@/services/statService";
import type { TStatistics } from "@/types/statistics.t";
import { onSocket } from "@/services/socketService";
import { useSocket } from "@/contexts/SocketProvider";
import { PeerContext } from "@/contexts/PeerProvider";
import NumberFlow from "@number-flow/react";
import { Icon } from "@/components/Icons/Icon";

interface StatisticItemProps {
  icon: ReactNode;
  title: string;
  value: number;
  suffix?: string;
}

const DEFAULT_STATISTICS: TStatistics = {
  totalTransfers: 0,
  sizeTransferred: 0,
  users: 0,
  messagesSent: 0,
};

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
  const [statistics, setStatistics] = useState<TStatistics>(DEFAULT_STATISTICS);
  const { socket } = useSocket();
  const peerInstance = useContext(PeerContext);

  useEffect(() => {
    if (!peerInstance?.id) return;

    const fetchStatistics = async () => {
      try {
        const data = await statService.getStatistics();
        setStatistics(data);
      } catch (error) {
        console.error("Failed to fetch statistics:", error);
      }
    };
    void fetchStatistics();
  }, [peerInstance?.id]);

  useEffect(() => {
    if (!socket) return;

    onSocket("statistics-messages-sent-updated", (messages: number) => {
      setStatistics((prev) => ({ ...prev, messagesSent: messages }));
    });

    onSocket("statistics-users-updated", (users: number) => {
      setStatistics((prev) => ({ ...prev, users }));
    });

    onSocket(
      "statistics-file-transfers-updated",
      ({ count, size }: { count: number; size: number }) => {
        setStatistics((prev) => ({
          ...prev,
          totalTransfers: count,
          sizeTransferred: size,
        }));
      },
    );
  }, [socket]);

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
