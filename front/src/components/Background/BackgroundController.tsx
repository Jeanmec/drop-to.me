import { useTabStore } from "@/stores/useTabStore";

const BackgroundController = () => {
  const background = useTabStore((state) => state.background);

  return <>{background}</>;
};

export default BackgroundController;
