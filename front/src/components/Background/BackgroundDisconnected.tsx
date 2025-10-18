"use client";
import React from "react";
import { Radar } from "./Radar";

export default function BackgroundDisconnected() {
  return (
    <div className="animate-fade-in pointer-events-none absolute inset-0 z-0 overflow-hidden bg-gradient-to-t from-black to-stone-800">
      <Radar
        className="absolute -bottom-12 left-1/2 -translate-x-1/2 -translate-y-1/2"
        showNoise
      />
      <div className="absolute bottom-0 z-[1] h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
    </div>
  );
}
