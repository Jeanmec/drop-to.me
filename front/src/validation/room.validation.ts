import { z } from "zod";

export const joinRoomSchema = z.object({
  peerId: z.string().min(1, "Peer ID is required"),
  socketId: z.string().min(1, "Socket ID is required"),
});

export type JoinRoomDto = z.infer<typeof joinRoomSchema>;
