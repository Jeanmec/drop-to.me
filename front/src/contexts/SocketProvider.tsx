// 📁 contexts/SocketProvider.tsx
"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, type Socket } from "socket.io-client";

interface SocketContextValue {
  socket: Socket | null;
  socketId: string | undefined;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socketId, setSocketId] = useState<string | undefined>();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL, {
      autoConnect: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => setSocketId(socket.id));
    socket.on("disconnect", () => setSocketId(undefined));

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, socketId }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within a SocketProvider");
  return ctx;
};
