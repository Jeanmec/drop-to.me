"use client";
import {
  setSocketInstance,
  emitSocket,
  onSocket,
} from "@/services/socketService";
import {
  initializePeerListeners,
  cleanupPeerListeners,
} from "@/listeners/peerListeners";
import {
  initializeStatsListeners,
  cleanupStatsListeners,
} from "@/listeners/statsListeners";
import {
  cancelTransfersForPeer,
  cancelAllSendTransfers,
} from "@/services/peerService";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { usePeersStore } from "@/stores/usePeersStore";
import { useStatsStore } from "@/stores/useStatsStore";
import { usePeer } from "@/contexts/PeerProvider";

interface SocketContextValue {
  socket: Socket | null;
  isRoomJoined: boolean;
  userIp: string | null;
}

interface SocketProviderProps {
  children: ReactNode;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export const SocketProvider: FC<SocketProviderProps> = ({ children }) => {
  const [isRoomJoined, setIsRoomJoined] = useState(false);
  const [userIp, setUserIp] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const { removeTargetPeer, addTargetPeer } = usePeersStore();
  const { updateMessageCount, updateUserCount, updateFileStats } =
    useStatsStore();
  const { peer } = usePeer();

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL, {
      autoConnect: true,
      transports: ["websocket"],
      path: "/socket.io",
    });
    socketRef.current = socket;
    setSocketInstance(socket);

    socket.on("connect", () => {});

    onSocket("disconnect", () => {
      setIsRoomJoined(false);
    });

    onSocket("error", (error) => {
      console.error("SocketProvider: Socket error:", error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!peer || !peer.id) return;

    // Initialize peer listeners
    initializePeerListeners({
      onJoinSuccess: (data) => {
        setIsRoomJoined(true);
        setUserIp(data.ip);
        data.peers.forEach((targetPeer: string) => {
          if (peer && peer.id !== targetPeer) {
            addTargetPeer(targetPeer);
          }
        });
      },
      onPeerLeft: (peerId) => {
        cancelTransfersForPeer(peerId);
        removeTargetPeer(peerId);

        const remainingPeers = usePeersStore.getState().targetPeers;
        if (remainingPeers.length === 0) {
          cancelAllSendTransfers();
        }
      },
      onPeerJoined: (targetPeerId) => {
        if (peer && peer.id !== targetPeerId) {
          addTargetPeer(targetPeerId);
        }
      },
    });

    initializeStatsListeners({
      onUpdateStat: (data) => {
        if (data.type === "messages") {
          updateMessageCount(data.count);
        } else if (data.type === "users") {
          updateUserCount(data.count);
        } else if (data.type === "files" && data.size !== undefined) {
          updateFileStats(data.count, data.size);
        }
      },
    });

    return () => {
      cleanupPeerListeners();
      cleanupStatsListeners();
    };
  }, [
    peer,
    addTargetPeer,
    removeTargetPeer,
    updateFileStats,
    updateMessageCount,
    updateUserCount,
  ]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !peer?.id) {
      return;
    }

    const joinRoom = () => {
      emitSocket("join-room", { peerId: peer.id });
    };

    if (socket.connected) {
      joinRoom();
    }

    socket.on("connect", joinRoom);

    return () => {
      socket.off("connect", joinRoom);
    };
  }, [peer?.id]);

  const value = {
    socket: socketRef.current,
    isRoomJoined,
    userIp,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextValue => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
