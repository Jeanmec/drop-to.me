"use client";
import Hero from "@/components/LandingPage/Hero";
import FileTransfer from "@/components/Forms/FileTransfer/FileTransfer";
import Alone from "@/components/Clients/Alone";
import Disconnected from "@/components/Clients/Disconnected";
import { usePeersStore } from "@/stores/usePeersStore";
import { Chat } from "@/components/Forms/Chat/Chat";
import Statistics from "@/components/Statistic/Statistics";
import Informations from "@/components/Informations";

export default function HomePage() {
  const { targetPeers, isPeerDisconnected } = usePeersStore();
  const hasTargetPeers = targetPeers.length > 0;

  return (
    <>
      <main className="relative flex min-h-screen flex-col items-center px-4 pt-8 pb-24 text-white md:pt-12">
        <Hero />
        {isPeerDisconnected ? (
          <Disconnected />
        ) : (
          <>
            <Chat />
            {hasTargetPeers ? <FileTransfer /> : <Alone />}
          </>
        )}
      </main>
      <div className="w-full">
        <Statistics />
        <Informations />
      </div>
    </>
  );
}
