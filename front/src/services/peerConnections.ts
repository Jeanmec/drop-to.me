import type { DataConnection, Peer } from "peerjs";
import { usePeersStore } from "@/stores/usePeersStore";
import {
  cancelTransfersForPeer,
  failMessagesPendingOn,
  handleIncomingData,
  sendHello,
} from "@/services/peerService";
import type { TPeer } from "@/types/peer.t";

const liveConnections = new Set<DataConnection>();

const isInitiator = (selfId: string, remoteId: string) => selfId < remoteId;

const isIceConnected = (state: RTCIceConnectionState) =>
  state === "connected" || state === "completed";

const findTarget = (peerId: string) =>
  usePeersStore.getState().targetPeers.find((peer) => peer.peerId === peerId);

const releaseIfCurrent = (conn: DataConnection) => {
  if (findTarget(conn.peer)?.connection !== conn) {
    return;
  }
  cancelTransfersForPeer(conn.peer);
  usePeersStore
    .getState()
    .updatePeer(conn.peer, { connection: null, isReachable: false });
};

const forgetConnection = (conn: DataConnection) => {
  if (liveConnections.delete(conn)) {
    failMessagesPendingOn(conn);
    releaseIfCurrent(conn);
  }
};

// peerjs emits no "close" for a connection that never opened
const closeConnection = (conn: DataConnection) => {
  conn.close();
  forgetConnection(conn);
};

const setReachableIfCurrent = (conn: DataConnection, isReachable: boolean) => {
  const target = findTarget(conn.peer);
  if (target?.connection === conn && target.isReachable !== isReachable) {
    usePeersStore.getState().updatePeer(conn.peer, { isReachable });
  }
};

const trackConnection = (conn: DataConnection, onOpen: () => void) => {
  liveConnections.add(conn);
  conn.on("open", () => {
    onOpen();
    sendHello(conn);
  });
  conn.on("iceStateChanged", (state) =>
    setReachableIfCurrent(conn, conn.open && isIceConnected(state)),
  );
  conn.on("data", (data) => handleIncomingData(data, conn.peer, conn));
  conn.on("close", () => forgetConnection(conn));
  conn.on("error", () => closeConnection(conn));
};

const attachIncoming = (conn: DataConnection, selfId: string) => {
  const target = findTarget(conn.peer);
  const previous = target?.connection;
  if (!target || (previous?.open && !isInitiator(conn.peer, selfId))) {
    closeConnection(conn);
    return;
  }
  usePeersStore
    .getState()
    .updatePeer(conn.peer, { connection: conn, isReachable: true });
  if (previous) {
    closeConnection(previous);
  }
};

export const acceptConnection = (
  conn: DataConnection,
  selfId: string,
): void => {
  trackConnection(conn, () => attachIncoming(conn, selfId));
};

export const connectToMissingPeers = (
  localPeer: Peer,
  targets: TPeer[],
): void => {
  if (localPeer.disconnected || localPeer.destroyed) {
    return;
  }
  targets.forEach((target) => {
    if (target.connection || !isInitiator(localPeer.id, target.peerId)) {
      return;
    }
    const conn = localPeer.connect(target.peerId, { reliable: true });
    trackConnection(conn, () => setReachableIfCurrent(conn, true));
    usePeersStore.getState().updatePeer(target.peerId, { connection: conn });
  });
};

// a peer that rejoins the room may have lost its end of the link without notice
export const resetConnectionTo = (peerId: string): void => {
  const connection = findTarget(peerId)?.connection;
  if (connection) {
    closeConnection(connection);
  }
};

export const closeConnectionsTo = (peerId: string): void => {
  liveConnections.forEach((conn) => {
    if (conn.peer === peerId) {
      closeConnection(conn);
    }
  });
};

// peerjs names the unreachable peer only in the error message
export const closePendingConnectionsNamedIn = (message: string): void => {
  liveConnections.forEach((conn) => {
    if (!conn.open && message.includes(conn.peer)) {
      closeConnection(conn);
    }
  });
};

export const closeAllConnections = (): void => {
  liveConnections.forEach(closeConnection);
};
