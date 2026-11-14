interface EnteringRoomNoteProps {
  roomCode: string;
}

export default function EnteringRoomNote({ roomCode }: EnteringRoomNoteProps) {
  return (
    <>
      Entering room{" "}
      <b className="text-moon font-medium tracking-wider">{roomCode}</b>
    </>
  );
}
