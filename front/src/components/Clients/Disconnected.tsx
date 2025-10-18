import BackgroundDisconnected from "../Background/BackgroundDisconnected";
import { Icon } from "../Icons/Icon";
import GradientTitle from "../ui/GradientTitle";

export default function Disconnected() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <>
      <BackgroundDisconnected />
      <div className="absolute top-[67.5vh] left-1/2 z-[1] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4">
        <GradientTitle className="flex justify-center gap-2">
          Disconnected
        </GradientTitle>
        <span className="text-description max-w-md text-center">
          You have been disconnected from the PeerJS server. Please reload the
          page to reconnect.
        </span>
        <button
          onClick={handleReload}
          className="group text-primary-blue flex cursor-pointer gap-2 rounded-lg px-12 py-2 text-xl"
        >
          <Icon.reload className="text-primary-shadow text-5xl transition-transform duration-500 will-change-transform group-hover:scale-125 group-hover:rotate-360" />
        </button>
      </div>
    </>
  );
}
