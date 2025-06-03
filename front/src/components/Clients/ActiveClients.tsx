"use client";
import { onSocket } from "@/services/socketService";
import { useLoadingStore } from "@/stores/useLoadingStore";
import { usePeersStore } from "@/stores/usePeersStore";
import { FiUser } from "react-icons/fi";

export default function ActiveClients() {
  const { isLoading } = useLoadingStore();
  const { Peers } = usePeersStore();

  const displayedPeers = Peers.slice(0, 5);

  if (!isLoading) {
    onSocket("peers", () => {
      console.log("salut");
    });
  }

  return (
    <div className="p-3">
      {(Peers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {displayedPeers.map((_, i) => (
            <div
              key={i}
              className="avatar avatar-placeholder ring-offset-base-100 rounded-full ring-2 ring-green-700 ring-offset-2"
            >
              <div className="rounded-full bg-green-950 p-4">
                <FiUser className="text-4xl text-green-500" />
              </div>
            </div>
          ))}

          {Peers.length > 5 && (
            <div className="mt-2 w-full text-center text-gray-500">
              +{Peers.length - 5} more
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
