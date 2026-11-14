import Seamark from "@/components/ui/Seamark";
import LeaveRoomButton from "./LeaveRoomButton";

interface RoomCodeProps {
  roomCode: string;
}

export default function RoomCode({ roomCode }: RoomCodeProps) {
  return (
    <Seamark isSteady>
      <span className="border-cream bg-night flex w-max items-center border font-mono">
        <span className="flex items-baseline gap-2 py-1.5 pr-3 pl-2.5">
          <span className="text-ash text-micro tracking-widest uppercase max-md:hidden">
            Room
          </span>
          <span className="text-moon text-label leading-4.5 tracking-wider max-md:text-xs">
            {roomCode}
          </span>
        </span>
        <LeaveRoomButton />
      </span>
    </Seamark>
  );
}
