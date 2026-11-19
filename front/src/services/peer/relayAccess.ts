import { SocketEvent } from "@droptome/shared";
import { getSocket } from "@/services/socketService";

// crypto.subtle is missing outside secure contexts, such as plain http
export const canEncrypt = (): boolean => Boolean(crypto.subtle);

// stays pending while the socket is down or outside its room
export const requestRelayToken = (): Promise<string> =>
  new Promise((resolve) => {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit(SocketEvent.GET_RELAY_TOKEN, null, resolve);
    }
  });
