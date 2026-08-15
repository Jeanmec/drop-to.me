"use client";

import {
  setSocketInstance,
  emitSocket,
  onSocket,
  offSocket,
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
import { fetchUserIp } from "@/services/roomService";
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
import { useUserStore } from "@/stores/useUserStore";
import { useRoomStore } from "@/stores/useRoomStore";
import { useChatStore } from "@/stores/useChatStore";
import { usePeer } from "@/contexts/PeerProvider";

interface SocketContextValue {
  socket: Socket | null;
  isRoomJoined: boolean;
  isJoining: boolean;
}

interface SocketProviderProps {
  children: ReactNode;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export const SocketProvider: FC<SocketProviderProps> = ({ children }) => {
  const [isRoomJoined, setIsRoomJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const lastJoinPayloadRef = useRef<{
    peerId: string;
    roomCode?: string;
  } | null>(null);
  const { removeTargetPeer, addTargetPeer, clearTargetPeers, detachConnections } =
    usePeersStore();
  const { updateMessageCount, updateUserCount, updateFileStats } =
    useStatsStore();
  const { peer } = usePeer();
  const { setIp, ip } = useUserStore();
  const roomCode = useRoomStore((s) => s.roomCode);
  const setRoomCode = useRoomStore((s) => s.setRoomCode);

  useEffect(() => {
    if (ip !== null) return;

    const loadIp = async () => {
      try {
        const fetchedIp = await fetchUserIp();
        setIp(fetchedIp);
      } catch (err) {
        console.error("SocketProvider: Failed to fetch IP", err);
        setIp("unknown");
      }
    };
    void loadIp();
  }, [setIp, ip]);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL, {
      autoConnect: true,
      transports: ["websocket"],
      path: "/socket.io",
    });
    socketRef.current = socket;
    setSocketInstance(socket);

    const handleDisconnect = () => {
      setIsRoomJoined(false);
      // The dead WebRTC channels won't recover on their own — drop them so
      // PeerProvider re-initiates fresh connections after reconnect.
      detachConnections();
    };

    const handleConnect = () => {
      const lastJoin = lastJoinPayloadRef.current;
      if (lastJoin) {
        setIsJoining(true);
        emitSocket("join-room", lastJoin);
      }
    };

    const handleError = (error: unknown) => {
      console.error("SocketProvider: Socket error:", error);
    };

    onSocket("disconnect", handleDisconnect);
    onSocket("connect", handleConnect);
    onSocket("error", handleError);

    return () => {
      offSocket("disconnect", handleDisconnect as (...args: unknown[]) => void);
      offSocket("connect", handleConnect as (...args: unknown[]) => void);
      offSocket("error", handleError as (...args: unknown[]) => void);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [detachConnections]);

  useEffect(() => {
    if (!peer || !peer.id) return;

    initializePeerListeners({
      onJoinSuccess: (data) => {
        setIsRoomJoined(true);
        setIsJoining(false);
        if (data.ip) setIp(data.ip);
        setRoomCode(data.roomCode ?? null);

        clearTargetPeers();
        data.peers.forEach((targetPeer: string) => {
          if (peer && peer.id !== targetPeer) {
            addTargetPeer(targetPeer);
          }
        });

        const roomLabel = data.roomCode
          ? `room ${data.roomCode}`
          : "default room";
        useChatStore.getState().addMessage({
          received: false,
          content: `Joined ${roomLabel}`,
          timestamp: new Date(),
          system: true,
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
    clearTargetPeers,
    updateFileStats,
    updateMessageCount,
    updateUserCount,
    setIp,
    setRoomCode,
  ]);

  // Joins a room when roomCode or peer changes.
  // If roomCode is null, the backend falls back to hashed IP as room ID.
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !peer?.id) return;

    // Close stale WebRTC connections to avoid ghost peers after room switch
    const currentPeers = usePeersStore.getState().targetPeers;
    currentPeers.forEach((p) => {
      if (p.connection?.open) p.connection.close();
    });
    clearTargetPeers();
    cancelAllSendTransfers();
    useChatStore.getState().setMessages([]);

    setIsJoining(true);
    setIsRoomJoined(false);
    emitSocket("leave-room");

    const timeoutId = setTimeout(() => {
      const payload: { peerId: string; roomCode?: string } = {
        peerId: peer.id,
      };
      if (roomCode) {
        payload.roomCode = roomCode;
      }
      lastJoinPayloadRef.current = payload;
      emitSocket("join-room", payload);
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [roomCode, peer?.id, clearTargetPeers]);

  const value = {
    socket: socketRef.current,
    isRoomJoined,
    isJoining,
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
