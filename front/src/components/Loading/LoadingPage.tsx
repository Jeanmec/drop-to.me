"use client";

import Hero from "@/components/LandingPage/Hero";
import LighthouseScene from "@/components/Scene/LighthouseScene";
import AnimationTimer from "@/components/ui/AnimationTimer";
import { ScenePhase } from "@/types/scene.t";

interface LoadingPageProps {
  isSlow: boolean;
  onIntroShown: () => void;
  onPatienceSpent: () => void;
}

export default function LoadingPage({
  isSlow,
  onIntroShown,
  onPatienceSpent,
}: LoadingPageProps) {
  return (
    <main>
      <LighthouseScene phase={ScenePhase.SKETCHED}>
        <Hero
          phase={ScenePhase.SKETCHED}
          note={
            isSlow && (
              <>
                Connection is taking longer than expected. Please check your
                network and{" "}
                <button
                  type="button"
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
      <AnimationTimer className="animate-intro" onElapsed={onIntroShown} />
      <AnimationTimer
        className="animate-patience"
        onElapsed={onPatienceSpent}
      />
    </main>
  );
}
