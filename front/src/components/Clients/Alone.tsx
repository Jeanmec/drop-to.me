import { userService } from "@/services/userService";
import { useEffect, useState } from "react";

export default function Alone() {
  const [ip, setIp] = useState("");

  useEffect(() => {
    const getIp = async () => {
      const { ip } = await userService.getClientIP();
      setIp(ip);
    };

    void getIp();
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <span className="flex justify-center gap-2 bg-gradient-to-t from-zinc-700 via-white to-white bg-clip-text text-center text-5xl font-bold text-transparent">
        Your alone
      </span>
      <span className="text-description text-center">
        Waiting for someone to join your network
      </span>
      {ip && (
        <span className="flex items-center gap-2">
          Your IP:
          <span className="rounded-md bg-emerald-950 p-1 px-2 text-emerald-400">
            {ip ? ip : <div className="skeleton h-4 w-32"></div>}
          </span>
        </span>
      )}
    </div>
  );
}
