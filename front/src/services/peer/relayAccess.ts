import { SocketEvent } from "@droptome/shared";
import { env } from "@/env";
import { getSocket } from "@/services/socketService";

// crypto.subtle is missing outside secure contexts, such as plain http
export const getRelayUrl = (): string | null =>
  env.NEXT_PUBLIC_RELAY_URL && crypto.subtle ? env.NEXT_PUBLIC_RELAY_URL : null;

export const requestRelayToken = (): Promise<string | null> =>
  new Promise((resolve) => {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit(SocketEvent.GET_RELAY_TOKEN, null, resolve);
    } else {
      resolve(null);
    }
  });
