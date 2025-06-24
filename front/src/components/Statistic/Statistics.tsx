import { type ReactNode } from "react";
import { FiDatabase, FiUser } from "react-icons/fi";
import { TbMessages } from "react-icons/tb";
import TextTicker from "@/components/Elements/TextTicker";

interface StatisticProps {
  icon: ReactNode;
  title: string;
  value: number;
}

function Statistic({ icon, title, value }: StatisticProps) {
  return (
    <div className="stat">
      <div className="stat-figure text-secondary-blue text-3xl">{icon}</div>
      <div className="stat-title">{title}</div>
      <div className="stat-value w-24">
        <TextTicker value={value} />
      </div>
    </div>
  );
}

export default function Statistics() {
  return (
    <div className="flex w-full justify-center py-5">
      <div className="stats stats-vertical sm:stats-horizontal shadow">
        <Statistic
          icon={<FiDatabase />}
          title="Data Transferred"
          value={4200}
        />
        <Statistic icon={<FiUser />} title="Users" value={4200} />
        <Statistic icon={<TbMessages />} title="Messages Sent" value={1200} />
      </div>
    </div>
  );
}
