"use client";
import React from "react";
import ParticleLoader from "./ParticleLoader";
import { useLoadingDelay } from "@/hooks/useLoadingDelay";

export default function LoadingPage() {
  const ready = useLoadingDelay();

  if (ready) return null;

  return (
    <div
      className="animate-fade-out fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black text-9xl"
      style={{
        animationDelay: `${process.env.NEXT_PUBLIC_LOADING_SCREEN_DURATION}ms`,
        animationDuration: "500ms",
        animationFillMode: "forwards",
        animationTimingFunction: "ease-out",
      }}
    >
      <ParticleLoader className="h-64 w-64" />
    </div>
  );
}
