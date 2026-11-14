"use client";

import { Toaster } from "sonner";
import { useIsPhoneWidth } from "@/hooks/useIsPhoneWidth";

const DESKTOP_MAX_TOASTS = 3;
const PHONE_MAX_TOASTS = 2;
const TOAST_GAP_PX = 12;

export default function ToastShelf() {
  const isPhoneWidth = useIsPhoneWidth();

  return (
    <Toaster
      position="top-right"
      expand
      visibleToasts={isPhoneWidth ? PHONE_MAX_TOASTS : DESKTOP_MAX_TOASTS}
      gap={TOAST_GAP_PX}
      offset={{
        top: "calc(var(--spacing) * 3.5)",
        right: "calc(var(--spacing) * 6)",
      }}
      mobileOffset={{
        top: "calc(var(--spacing) * 2.5)",
        right: "calc(var(--spacing) * 3)",
        left: "calc(var(--spacing) * 3)",
      }}
    />
  );
}
