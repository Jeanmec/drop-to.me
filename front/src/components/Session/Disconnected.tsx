import Icon from "@/components/Icons/Icon";
import BeaconButton from "@/components/ui/BeaconButton";
import StatusLine from "@/components/ui/StatusLine";

export default function Disconnected() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <>
      <BeaconButton onClick={handleReload}>
        <Icon.reload className="text-night size-5.5" />
        Reload
      </BeaconButton>
      <div role="status">
        <StatusLine
          title="Disconnected"
          detail="drop-to.me can't connect from this browser. Reload the page to try again."
        />
      </div>
    </>
  );
}
