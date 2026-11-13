import type { TPeer } from "@/types/peer.t";
import type { TMooring } from "@/types/scene.t";

const findPeer = (peers: TPeer[], peerId: string): TPeer | undefined =>
  peers.find((peer) => peer.peerId === peerId);

// returns the array it was given while nothing changes
export const moorPeers = (
  moorings: (TMooring | null)[],
  peers: TPeer[],
): (TMooring | null)[] => {
  let hasChanged = false;

  const next = moorings.map((mooring) => {
    const peer = mooring ? findPeer(peers, mooring.peerId) : undefined;
    if (!mooring || !peer || peer.device === mooring.device) {
      return mooring;
    }
    hasChanged = true;
    return { peerId: peer.peerId, device: peer.device };
  });

  for (const peer of peers) {
    if (next.some((mooring) => mooring?.peerId === peer.peerId)) {
      continue;
    }
    const freeBerth = next.findIndex(
      (mooring) => !mooring || !findPeer(peers, mooring.peerId),
    );
    if (freeBerth === -1) {
      break;
    }
    next[freeBerth] = { peerId: peer.peerId, device: peer.device };
    hasChanged = true;
  }

  return hasChanged ? next : moorings;
};
