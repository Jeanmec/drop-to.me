export function removePeerBySocketId(
  clients: Record<string, string>,
  socketId: string,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(clients).filter(
      ([clientSocketId]) => clientSocketId !== socketId,
    ),
  );
}

export function getPeersFromClients(clients: Record<string, string>): string[] {
  return Object.values(clients);
}

export function removePeerById(peers: string[], peerId: string): string[] {
  return peers.filter((peer) => peer !== peerId);
}
