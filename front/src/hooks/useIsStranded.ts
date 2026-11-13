import {
  selectIsServerUnreachable,
  useConnectionStore,
} from "@/stores/useConnectionStore";
import { usePeersStore } from "@/stores/usePeersStore";

export function useIsStranded(): boolean {
  const isServerUnreachable = useConnectionStore(selectIsServerUnreachable);
  const hasReachablePeer = usePeersStore((state) =>
    state.targetPeers.some((peer) => peer.isReachable),
  );

  return isServerUnreachable && !hasReachablePeer;
}
