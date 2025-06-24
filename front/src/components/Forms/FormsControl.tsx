"use client";
import { useLoadingStore } from "@/stores/useLoadingStore";
import { useTabStore } from "@/stores/useTabStore";
import RippleLoader from "../loaders/RippleLoader";
import Tabs from "../Navigation/Tabs";

export default function FormsControl() {
  const content = useTabStore((state) => state.content);
  const { isLoading } = useLoadingStore();

  return (
    <>
      <>
        {isLoading ? (
          <div className="absolute top-[67.5vh] left-1/2 -translate-x-1/2 -translate-y-1/2">
            {<RippleLoader />}
          </div>
        ) : (
          <>
            <div className="absolute bottom-0 z-[3] flex h-fit justify-center pb-4">
              <Tabs />
            </div>
            {content}
          </>
        )}
      </>
    </>
  );
}
