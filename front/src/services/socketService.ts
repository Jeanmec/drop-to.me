import { SocketEvent } from "@droptome/shared";
import { io } from "socket.io-client";
import { env } from "@/env";
import type { TSignal } from "@/schemas/signal.schema";
import type { TRoomSocket } from "@/types/socket.t";

let socketInstance: TRoomSocket | null = null;

export const openSocket = (): TRoomSocket => {
  socketInstance = io(env.NEXT_PUBLIC_BACKEND_URL, {
    transports: ["websocket"],
  });
  return socketInstance;
};

export const closeSocket = (): void => {
  socketInstance?.removeAllListeners();
  socketInstance?.disconnect();
  socketInstance = null;
};

export const getSocket = (): TRoomSocket | null => socketInstance;

// dropped while disconnected: the rejoin after the reconnection renegotiates every link
export const sendSignal = (to: string, signal: TSignal): void => {
  if (socketInstance?.connected) {
    socketInstance.emit(SocketEvent.SIGNAL, { to, signal });
  }
};
