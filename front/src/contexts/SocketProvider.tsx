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
import {
  closeAllConnections,
  closeConnectionsTo,
  resetConnectionTo,
} from "@/services/peerConnections";
import { fetchUserIp } from "@/services/roomService";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { usePeersStore } from "@/stores/usePeersStore";
import { useStatsStore } from "@/stores/useStatsStore";
import { useUserStore } from "@/stores/useUserStore";
import { useRoomStore } from "@/stores/useRoomStore";
import { useChatStore } from "@/stores/useChatStore";
import { useConnectionStore } from "@/stores/useConnectionStore";
import { usePeer } from "@/contexts/PeerProvider";

interface SocketContextValue {
  socket: Socket | null;
  isRoomJoined: boolean;
  isJoining: boolean;
}

interface SocketProviderProps {
  children: ReactNode;
}

interface JoinRoomPayload {
  peerId: string;
  roomCode?: string;
}

const SocketContext = createContext<SocketContextValue | null>(null);

const DEFAULT_ROOM_KEY = "default";
// back gateway: pingInterval 10 s + pingTimeout 10 s
const PING_DEADLINE_MS = 25_000;

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [isRoomJoined, setIsRoomJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const setSocketConnected = useConnectionStore(
    (state) => state.setSocketConnected,
  );
  const recordFailedAttempt = useConnectionStore(
    (state) => state.recordFailedAttempt,
  );
  const lastJoinPayloadRef = useRef<JoinRoomPayload | null>(null);
  const announcedRoomRef = useRef<string | null | undefined>(undefined);
  const { removeTargetPeer, addTargetPeer, clearTargetPeers } = usePeersStore();
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
    let lastPingAt = Date.now();

    const handleDisconnect = () => {
      setSocketConnected(false);
    };

    const handleConnect = () => {
      setSocketConnected(true);
      lastPingAt = Date.now();
      const lastJoin = lastJoinPayloadRef.current;
      if (lastJoin) {
        emitSocket("join-room", lastJoin);
      }
    };

    const handlePing = () => {
      lastPingAt = Date.now();
    };

    const handleError = (error: unknown) => {
      console.error("SocketProvider: Socket error:", error);
    };

    // a page frozen past the server ping timeout keeps a socket that reports connected
    const reconnectIfStale = () => {
      if (!socket.connected || Date.now() - lastPingAt > PING_DEADLINE_MS) {
        socket.disconnect().connect();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        reconnectIfStale();
      }
    };

    onSocket("disconnect", handleDisconnect);
    onSocket("connect", handleConnect);
    onSocket("connect_error", recordFailedAttempt);
    onSocket("error", handleError);
    socket.io.on("ping", handlePing);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", reconnectIfStale);

    return () => {
      offSocket("disconnect", handleDisconnect);
      offSocket("connect", handleConnect);
      offSocket("connect_error", recordFailedAttempt);
      offSocket("error", handleError);
      socket.io.off("ping", handlePing);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", reconnectIfStale);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [setSocketConnected, recordFailedAttempt]);

  useEffect(() => {
    if (!peer || !peer.id) return;

    initializePeerListeners({
      onJoinSuccess: (data) => {
        setIsRoomJoined(true);
        setIsJoining(false);
        if (data.ip) setIp(data.ip);
        setRoomCode(data.roomCode ?? null);

        const wanted = new Set(
          data.peers.filter((targetPeer: string) => targetPeer !== peer.id),
        );
        usePeersStore.getState().targetPeers.forEach((p) => {
          if (wanted.has(p.peerId)) {
            resetConnectionTo(p.peerId);
          } else {
            closeConnectionsTo(p.peerId);
            cancelTransfersForPeer(p.peerId);
            removeTargetPeer(p.peerId);
          }
        });
        wanted.forEach((targetPeer) => addTargetPeer(targetPeer));

        const joinedRoom = data.roomCode ?? null;
        if (announcedRoomRef.current !== joinedRoom) {
          announcedRoomRef.current = joinedRoom;
          const roomLabel = data.roomCode
            ? `room ${data.roomCode}`
            : "default room";
          useChatStore.getState().addMessage({
            received: false,
            content: `Joined ${roomLabel}`,
            timestamp: new Date(),
            system: true,
          });
        }
      },
      onPeerLeft: (peerId) => {
        closeConnectionsTo(peerId);
        cancelTransfersForPeer(peerId);
        removeTargetPeer(peerId);

        const remainingPeers = usePeersStore.getState().targetPeers;
        if (remainingPeers.length === 0) {
          cancelAllSendTransfers();
        }
      },
      onPeerJoined: (targetPeerId) => {
        if (peer && peer.id !== targetPeerId) {
          resetConnectionTo(targetPeerId);
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
    setIp,
    setRoomCode,
  ]);

  // Joins a room when roomCode or peer changes.
  // If roomCode is null, the backend falls back to hashed IP as room ID.
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !peer?.id) return;

    // peer.id bounces id → null → id on a PeerJS reconnect; handleConnect already rejoined.
    const lastJoin = lastJoinPayloadRef.current;
    if (
      lastJoin &&
      lastJoin.peerId === peer.id &&
      (lastJoin.roomCode ?? null) === (roomCode ?? null)
    ) {
      return;
    }

    const nextRoom = roomCode ?? null;
    const isRoomChange = !lastJoin || (lastJoin.roomCode ?? null) !== nextRoom;

    closeAllConnections();
    clearTargetPeers();
    cancelAllSendTransfers();
    if (isRoomChange) {
      useChatStore.getState().openRoom(nextRoom ?? DEFAULT_ROOM_KEY);
      announcedRoomRef.current = undefined;
    }

    setIsJoining(true);
    setIsRoomJoined(false);

    const payload: JoinRoomPayload = { peerId: peer.id };
    if (roomCode) {
      payload.roomCode = roomCode;
    }
    lastJoinPayloadRef.current = payload;
    // A buffered emit is flushed right before "connect" and doubles the join handleConnect replays.
    if (socket.connected) {
      emitSocket("join-room", payload);
    }
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
