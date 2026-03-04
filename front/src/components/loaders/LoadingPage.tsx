"use client";
import React from "react";
import ParticleLoader from "./ParticleLoader";

interface LoadingPageProps {
  timedOut?: boolean;
}

export default function LoadingPage({ timedOut }: LoadingPageProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 overflow-hidden bg-black text-9xl"
      style={{
        animationDelay: "0ms",
        animationDuration: "500ms",
        animationFillMode: "forwards",
        animationTimingFunction: "ease-out",
      }}
    >
      <ParticleLoader className="h-64 w-64" />
      {timedOut && (
        <p className="animate-fade-in max-w-sm text-center text-sm text-slate-400">
          Connection is taking longer than expected. Please check your network
          and{" "}
          <button
            onClick={() => window.location.reload()}
            className="text-primary-blue underline"
          >
            reload the page
          </button>
          .
        </p>
      )}
    </div>
  );
}
