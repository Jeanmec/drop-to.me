"use client";
import React from "react";
import ParticleLoader from "./ParticleLoader";

export default function LoadingPage() {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black text-9xl"
      style={{
        animationDelay: "0ms",
        animationDuration: "500ms",
        animationFillMode: "forwards",
        animationTimingFunction: "ease-out",
      }}
    >
      <ParticleLoader className="h-64 w-64" />
    </div>
  );
}
