import { selectHasReachablePeer, usePeersStore } from "@/stores/usePeersStore";
import {
  selectIsServerUnreachable,
  useSessionStore,
} from "@/stores/useSessionStore";

export function useIsStranded(): boolean {
  const isServerUnreachable = useSessionStore(selectIsServerUnreachable);
  const hasReachablePeer = usePeersStore(selectHasReachablePeer);

  return isServerUnreachable && !hasReachablePeer;
}
