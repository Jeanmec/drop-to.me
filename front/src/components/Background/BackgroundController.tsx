import { useTabStore } from "@/stores/useTabStore";
import { usePeersStore } from "@/stores/usePeersStore";
import BackgroundRadar from "@/components/Background/BackgroundRadar";

const BackgroundController = () => {
  const background = useTabStore((state) => state.background);

  const { globalPeersState } = usePeersStore();

  return (
    <>{globalPeersState === "connected" ? background : <BackgroundRadar />}</>
  );
};

export default BackgroundController;
