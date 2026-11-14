import {
  SocketEvent,
  type TJoinRoom,
  type TJoinSuccess,
} from "@droptome/shared";
import {
  cancelTransfersWith,
  closeAllConnections,
  closeConnectionTo,
  connectTo,
  connectToMissingPeers,
  handleSignal,
  retryStalledLinks,
} from "@/services/peer/connections";
import { cancelAllSends } from "@/services/peer/fileSender";
import { SELF_PEER_ID, SELF_PEER_TOKEN } from "@/services/peer/selfPeer";
import { closeSocket, getSocket, openSocket } from "@/services/socketService";
import { loadStatistics } from "@/services/statService";
import { dismissReceivedFiles } from "@/services/toastService";
import { abortTransfer } from "@/services/transferService";
import { useChatStore } from "@/stores/useChatStore";
import { usePeersStore } from "@/stores/usePeersStore";
import { useRoomStore } from "@/stores/useRoomStore";
import { useSessionStore } from "@/stores/useSessionStore";
import { useStatsStore } from "@/stores/useStatsStore";

const DEFAULT_ROOM_KEY = "default";
// back gateway: pingInterval 10 s + pingTimeout 10 s
const PING_DEADLINE_MS = 25_000;

let lastJoin: TJoinRoom | null = null;
let announcedRoom: string | null | undefined;

const handlePeerJoined = (peerId: string): void => {
  if (peerId === SELF_PEER_ID) {
    return;
  }
  // a peer that rejoins the room may have lost its end of the link without notice
  closeConnectionTo(peerId);
  usePeersStore.getState().addTargetPeer(peerId);
  connectTo(peerId);
};

const handlePeerLeft = (peerId: string): void => {
  closeConnectionTo(peerId);
  cancelTransfersWith(peerId);
  usePeersStore.getState().removeTargetPeer(peerId);

  if (usePeersStore.getState().targetPeers.length === 0) {
    cancelAllSends();
  }
};

const replaceTargetPeers = (peerIds: string[]): void => {
  const { targetPeers, addTargetPeer, removeTargetPeer } =
    usePeersStore.getState();
  const wanted = new Set(peerIds.filter((peerId) => peerId !== SELF_PEER_ID));

  targetPeers.forEach(({ peerId }) => {
    closeConnectionTo(peerId);
    if (!wanted.has(peerId)) {
      cancelTransfersWith(peerId);
      removeTargetPeer(peerId);
    }
  });
  wanted.forEach(addTargetPeer);
  connectToMissingPeers();
};

const handleJoinSuccess = ({ peers, ip, roomCode }: TJoinSuccess): void => {
  useSessionStore.getState().completeJoin(ip);
  useRoomStore.getState().setRoomCode(roomCode);
  replaceTargetPeers(peers);

  if (announcedRoom !== roomCode) {
    announcedRoom = roomCode;
    useChatStore.getState().addMessage({
      received: false,
      content: roomCode ? `Joined room ${roomCode}` : "Joined default room",
      system: true,
    });
  }
};

// If roomCode is null, the backend falls back to hashed IP as room ID.
const joinRoom = (roomCode: string | null): void => {
  lastJoin = roomCode
    ? { peerId: SELF_PEER_ID, token: SELF_PEER_TOKEN, roomCode }
    : { peerId: SELF_PEER_ID, token: SELF_PEER_TOKEN };
  useSessionStore.getState().startJoining();

  const socket = getSocket();
  // an emit buffered before "connect" is flushed with it and doubles the join handleConnect replays
  if (socket?.connected) {
    socket.emit(SocketEvent.JOIN_ROOM, lastJoin);
  }
};

const enterRoom = (roomCode: string | null): void => {
  closeAllConnections();
  usePeersStore.getState().clearTargetPeers();
  abortTransfer();
  dismissReceivedFiles();
  useChatStore.getState().openRoom(roomCode ?? DEFAULT_ROOM_KEY);
  announcedRoom = undefined;
  joinRoom(roomCode);
};

export const startSession = (): (() => void) => {
  const { setSocketConnected, recordFailedAttempt, markWebRtcUnsupported } =
    useSessionStore.getState();
  const socket = openSocket();
  let lastPingAt = Date.now();

  const handleConnect = () => {
    setSocketConnected(true);
    lastPingAt = Date.now();
    if (lastJoin) {
      socket.emit(SocketEvent.JOIN_ROOM, lastJoin);
    }
    void loadStatistics();
  };

  const handlePing = () => {
    lastPingAt = Date.now();
    retryStalledLinks();
  };

  // a page frozen past the server ping timeout keeps a socket that reports connected
  const reconnectIfStale = () => {
    if (!socket.connected || Date.now() - lastPingAt > PING_DEADLINE_MS) {
      socket.disconnect().connect();
    }
  };

  const handleVisibilityChange = () => {
    if (!document.hidden) {
      reconnectIfStale();
    }
  };

  socket.on("connect", handleConnect);
  socket.on("disconnect", () => setSocketConnected(false));
  socket.on("connect_error", recordFailedAttempt);
  socket.on(SocketEvent.JOIN_SUCCESS, handleJoinSuccess);
  socket.on(SocketEvent.PEER_JOINED, handlePeerJoined);
  socket.on(SocketEvent.PEER_LEFT, handlePeerLeft);
  socket.on(SocketEvent.SIGNAL, ({ from, signal }) =>
    handleSignal(from, signal),
  );
  socket.on(SocketEvent.UPDATE_STAT, useStatsStore.getState().applyUpdate);
  socket.io.on("ping", handlePing);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("online", reconnectIfStale);

  const unsubscribeRoom = useRoomStore.subscribe((state, previousState) => {
    if (state.roomCode !== previousState.roomCode) {
      enterRoom(state.roomCode);
    }
  });

  if (typeof RTCPeerConnection === "undefined") {
    markWebRtcUnsupported();
    unsubscribeRoom();
  } else {
    enterRoom(useRoomStore.getState().roomCode);
  }

  return () => {
    unsubscribeRoom();
    socket.io.off("ping", handlePing);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("online", reconnectIfStale);
    closeSocket();
    closeAllConnections();
    lastJoin = null;
  };
};
