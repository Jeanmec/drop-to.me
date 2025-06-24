import { userService } from "@/services/userService";
import { useEffect, useState } from "react";
import { PiSmileySadBold } from "react-icons/pi";

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
      <span className="font-poppins flex justify-center gap-2 bg-gradient-to-t from-zinc-700 via-white to-white bg-clip-text text-6xl font-bold text-transparent">
        Your alone <PiSmileySadBold className="text-2xl" />
      </span>
      <span className="text-description">
        Waiting for someone to join your network
      </span>
      {ip && (
        <span className="flex gap-2">
          Your IP:
          <span className="badge badge-soft badge-success">
            {ip ? ip : <div className="skeleton h-4 w-32"></div>}
          </span>
        </span>
      )}
    </div>
  );
}
