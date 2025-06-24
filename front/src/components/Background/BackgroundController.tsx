import { useTabStore } from "@/stores/useTabStore";
import { useLoadingStore } from "@/stores/useLoadingStore";
import { usePeersStore } from "@/stores/usePeersStore";
import BackgroundRadar from "@/components/Background/BackgroundRadar";

const BackgroundController = () => {
  const background = useTabStore((state) => state.background);
  const { isLoading } = useLoadingStore();
  const { targetPeers } = usePeersStore();

  return <>{targetPeers?.length === 0 ? <BackgroundRadar /> : background}</>;
};

export default BackgroundController;
