import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@droptome/shared";
import type { Socket } from "socket.io-client";

export type TRoomSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
