"use client";
import { onSocket } from "@/services/socketService";
import { useLoadingStore } from "@/stores/useLoadingStore";
import { usePeersStore } from "@/stores/usePeersStore";
import { Icon } from "../Icons/Icon";

export default function ActiveClients() {
  const { isLoading } = useLoadingStore();
  const { targetPeers } = usePeersStore();

  const displayedPeers = targetPeers.slice(0, 5);

  if (!isLoading) {
    onSocket("peers", () => {
      console.log("salut");
    });
  }

  return (
    <div className="p-3">
      <div>
        {targetPeers.map((target) => (
          <pre key={target.peerId}>{target.state}</pre>
        ))}
      </div>
      {(targetPeers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {displayedPeers.map((peer, i) => (
            <div
              key={i}
              className="avatar avatar-placeholder ring-offset-base-100 rounded-full ring-2 ring-green-700 ring-offset-2"
            >
              <div className="rounded-full bg-green-950 p-4">
                {peer?.state === "sending" ? (
                  <Icon.upload className="text-4xl text-green-500" />
                ) : peer?.state === "delivered" ? (
                  <Icon.check className="text-4xl text-green-500" />
                ) : (
                  <Icon.user className="text-4xl text-gray-500" />
                )}
              </div>
            </div>
          ))}

          {targetPeers.length > 5 && (
            <div className="mt-2 w-full text-center text-gray-500">
              +{targetPeers.length - 5} more
            </div>
          )}
        </div>
      )) ?? (
        <div className="mt-2 w-full text-center text-gray-500">
          No active clients
        </div>
      )}
    </div>
  );
}
