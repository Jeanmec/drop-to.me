"use client";
import { useTabStore } from "@/stores/useTabStore";

export default function FormsControl() {
  const content = useTabStore((state) => state.content);

  return (
    <div className="mt-[184px] flex flex-1 items-center justify-center">
      {content}
    </div>
  );
}
