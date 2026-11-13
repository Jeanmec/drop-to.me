"use client";
import React from "react";
import Hero from "@/components/LandingPage/Hero";
import LighthouseScene from "@/components/Scene/LighthouseScene";

interface LoadingPageProps {
  timedOut?: boolean;
}

export default function LoadingPage({ timedOut }: LoadingPageProps) {
  return (
    <main>
      <LighthouseScene phase="sketched">
        <Hero
          phase="sketched"
          note={
            timedOut && (
              <>
                Connection is taking longer than expected. Please check your
                network and{" "}
                <button
                  onClick={() => window.location.reload()}
                  className="text-moon cursor-pointer underline underline-offset-4"
                >
                  reload the page
                </button>
                .
              </>
            )
          }
        />
      </LighthouseScene>
    </main>
  );
}
