import { RelayNotice, type TRelayJoin } from '@droptome/shared';
import { WebSocket, type RawData } from 'ws';
import { z } from 'zod';
import { isTokenValid } from './token';

const LINK_ID_MAX_LENGTH = 64;
const MAX_UNPAIRED_SOCKETS = 256;
const HIGH_WATER_BYTES = 1024 * 1024;
const LOW_WATER_BYTES = 256 * 1024;
const POLICY_VIOLATION = 1008;

const relayJoinSchema = z.object({
  linkId: z.string().min(1).max(LINK_ID_MAX_LENGTH),
  token: z.string(),
});

const unpaired = new Set<WebSocket>();
const waiting = new Map<string, WebSocket>();
const peers = new Map<WebSocket, WebSocket>();

const readJson = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const readJoin = (data: RawData): TRelayJoin | null => {
  const join = relayJoinSchema.safeParse(
    Buffer.isBuffer(data) ? readJson(data.toString()) : null,
  );
  return join.success ? join.data : null;
};

// the set iterates in insertion order: its first socket is the one unpaired for the longest
const trackUnpaired = (socket: WebSocket): void => {
  unpaired.add(socket);
  if (unpaired.size > MAX_UNPAIRED_SOCKETS) {
    const [oldest] = unpaired;
    unpaired.delete(oldest);
    oldest.terminate();
  }
};

const pair = (first: WebSocket, second: WebSocket): void => {
  peers.set(first, second);
  peers.set(second, first);
  [first, second].forEach((socket) => {
    unpaired.delete(socket);
    socket.send(RelayNotice.PAIRED);
  });
};

const forward = (
  from: WebSocket,
  to: WebSocket,
  data: RawData,
  isBinary: boolean,
): void => {
  to.send(data, { binary: isBinary }, () => {
    if (from.isPaused && to.bufferedAmount < LOW_WATER_BYTES) {
      from.resume();
    }
  });
  if (to.bufferedAmount > HIGH_WATER_BYTES) {
    from.pause();
  }
};

export const acceptSocket = (socket: WebSocket, secret: string): void => {
  let joinedLinkId: string | null = null;

  trackUnpaired(socket);

  socket.on('message', (data, isBinary) => {
    if (socket.readyState !== WebSocket.OPEN) {
      return;
    }

    const peer = peers.get(socket);
    if (peer) {
      forward(socket, peer, data, isBinary);
      return;
    }

    const join = joinedLinkId === null && !isBinary ? readJoin(data) : null;
    if (!join || !isTokenValid(join.token, secret)) {
      socket.close(POLICY_VIOLATION);
      return;
    }

    joinedLinkId = join.linkId;
    const waitingSocket = waiting.get(join.linkId);
    if (waitingSocket?.readyState === WebSocket.OPEN) {
      waiting.delete(join.linkId);
      pair(socket, waitingSocket);
    } else {
      waiting.set(join.linkId, socket);
    }
  });

  socket.on('close', () => {
    unpaired.delete(socket);
    if (joinedLinkId !== null && waiting.get(joinedLinkId) === socket) {
      waiting.delete(joinedLinkId);
    }

    const peer = peers.get(socket);
    if (peer) {
      peers.delete(socket);
      peers.delete(peer);
      peer.close();
    }
  });

  // an "error" event without a listener throws and stops the process
  socket.on('error', () => undefined);
};
