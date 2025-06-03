"use client";
import { useTabStore } from "@/stores/useTabStore";

export default function FormsControl() {
  const content = useTabStore((state) => state.content);

  return <div className="">{content}</div>;
}
