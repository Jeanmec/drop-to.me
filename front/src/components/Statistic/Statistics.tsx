// components/Statistics.tsx
import { useEffect, useState, type ReactNode } from "react";
import { FiDatabase, FiUser } from "react-icons/fi";
import { TbMessages, TbArrowsTransferUpDown } from "react-icons/tb";
import { statService } from "@/services/statService";
import type { TStatistics } from "@/types/statistics.t";
import { onSocket } from "@/services/socketService";
import { useSocket } from "@/contexts/SocketProvider";
import NumberFlow from "@number-flow/react";

interface StatisticProps {
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

function Statistic({ icon, title, value, suffix }: StatisticProps) {
  return (
    <div className="stat">
      <div className="stat-figure text-secondary-blue text-3xl">{icon}</div>
      <div className="stat-title">{title}</div>
      <div className="stat-value w-24">
        <NumberFlow
          spinTiming={{ duration: 750 }}
          value={value}
          suffix={suffix}
        />
      </div>
    </div>
  );
}

export default function Statistics() {
  const [statistics, setStatistics] = useState<TStatistics>(DEFAULT_STATISTICS);
  const { socket } = useSocket();

  useEffect(() => {
    const fetchStatistics = async () => {
      const data = await statService.getStatistics();
      setStatistics(data);
    };
    void fetchStatistics();
  }, []);

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

  return (
    <div className="flex w-full justify-center py-5">
      <div className="stats stats-vertical sm:stats-horizontal shadow">
        <Statistic
          icon={<FiDatabase />}
          title="Data Files"
          value={sizeValue}
          suffix={sizeSuffix}
        />
        <Statistic icon={<FiUser />} title="Users" value={statistics.users} />
        <Statistic
          icon={<TbMessages />}
          title="Messages Sent"
          value={statistics.messagesSent}
        />
        <Statistic
          icon={<TbArrowsTransferUpDown />}
          title="Files Transferred"
          value={statistics.totalTransfers}
        />
      </div>
    </div>
  );
}
