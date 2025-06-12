"use client";
import { useLoadingStore } from "@/stores/useLoadingStore";
import { useTabStore } from "@/stores/useTabStore";
import RippleLoader from "../loaders/RippleLoader";

export default function FormsControl() {
  const content = useTabStore((state) => state.content);
  const { isLoading, startLoading, stopLoading } = useLoadingStore();

  return (
    <>
      {/* <div className="absolute top-[67.5vh] left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
        {isLoading ? <ParticleLoader /> : content}
      </div> */}

      <>
        {isLoading ? (
          <div className="absolute top-[67.5vh] left-1/2 -translate-x-1/2 -translate-y-1/2">
            <RippleLoader />
          </div>
        ) : (
          content
        )}
      </>
    </>
  );
}
