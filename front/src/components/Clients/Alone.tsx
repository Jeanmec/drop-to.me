import { useSocket } from "@/contexts/SocketProvider";
import RadarBackground from "../Background/BackgroundRadar";
import GradientTitle from "../ui/GradientTitle";

export default function Alone() {
  const { userIp } = useSocket();
  const ip = userIp || "";

  return (
    <>
      <RadarBackground />
      <div className="absolute top-[67.5vh] left-1/2 z-[1] flex w-full -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4 px-6">
        <GradientTitle className="flex justify-center gap-2">
          You are alone
        </GradientTitle>
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
    </>
  );
}
