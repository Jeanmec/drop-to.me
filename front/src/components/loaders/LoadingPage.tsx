"use client";
import React, { useState, useEffect } from "react";
import ParticleLoader from "./ParticleLoader";

const LoadingPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const fadeOutTimer = setTimeout(() => setIsFadingOut(true), 2000);
    const hideTimer = setTimeout(() => setIsLoading(false), 2500);
    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div
      className={`fixed inset-0 z-10 flex items-center justify-center overflow-hidden bg-black text-9xl ${
        isFadingOut ? "animate-fade-out" : ""
      }`}
      style={{ animationDuration: "500ms" }}
    >
      <ParticleLoader className="h-64 w-64" />
    </div>
  );
};

export default LoadingPage;
