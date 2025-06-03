import type { Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

export const setSocketInstance = (socket: Socket) => {
  socketInstance = socket;
};

export const emitSocket = <T = unknown>(event: string, payload?: T) => {
  if (!socketInstance) {
    console.warn("[Socket] emit attempted before socket was ready");
    return;
  }
  socketInstance.emit(event, payload);
};

export const onSocket = <T = unknown>(
  event: string,
  callback: (payload: T) => void,
) => {
  if (!socketInstance) {
    console.warn("[Socket] on attempted before socket was ready");
    return;
  }
  socketInstance.on(event, callback);
};

export const offSocket = (
  event: string,
  callback?: (...args: unknown[]) => void,
) => {
  if (!socketInstance) return;
  if (callback) {
    socketInstance.off(event, callback);
  } else {
    socketInstance.off(event);
  }
};

export const getSocket = () => socketInstance;
