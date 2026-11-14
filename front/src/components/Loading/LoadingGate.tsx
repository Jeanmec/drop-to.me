"use client";

import { useState, type ReactNode } from "react";
import LoadingPage from "@/components/Loading/LoadingPage";
import { useNetworkSession } from "@/hooks/useNetworkSession";
import { useSessionStore } from "@/stores/useSessionStore";

interface LoadingGateProps {
  children: ReactNode;
}

export default function LoadingGate({ children }: LoadingGateProps) {
  useNetworkSession();
  const hasConnected = useSessionStore((state) => state.hasConnected);
  const [isIntroShown, setIsIntroShown] = useState(false);
  const [isPatienceSpent, setIsPatienceSpent] = useState(false);

  if (!isIntroShown || !hasConnected) {
    return (
      <LoadingPage
        isSlow={isPatienceSpent}
        onIntroShown={() => setIsIntroShown(true)}
        onPatienceSpent={() => setIsPatienceSpent(true)}
      />
    );
  }
  return children;
}
