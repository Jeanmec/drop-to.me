"use client";
import React, { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ToastMessage from "@/components/Toast/ToastMessage";
import ToastFileTransfer from "@/components/Toast/ToastFileTransfer";
import DownloadFileToast from "@/components/Toast/ToastDownloadFile";
import { useToastEvents } from "@/library/toastService";
import { Icon } from "@/components/Icons/Icon";

export type ToastMessageType = "success" | "error" | "info" | "warning";
export type ToastType = "message" | "file-transfer" | "file-received";

type ToastMessage = {
  type: "message";
  messageType: ToastMessageType;
  message: string;
};

type ToastFileTransfer = {
  type: "file-transfer";
  fileName: string;
  progress: number;
  isUploading: boolean;
  isFailed?: boolean;
};

type ToastFileReceived = {
  type: "file-received";
  fileUrl: string;
  fileName: string;
  fileSize: number;
};

export type Toast = {
  id: string;
  autoClose?: number | false;
  isExiting?: boolean;
  data: ToastMessage | ToastFileTransfer | ToastFileReceived;
};

const EXIT_ANIMATION_DURATION = 200;
const DEFAULT_AUTO_CLOSE_DURATION = 5000;
const POSITION_CLASSES = {
  "top-right": "top-4 right-6",
  "top-center": "top-8 left-1/2 -translate-x-1/2 w-full px-12",
} as const;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [position, setPosition] = useState<"top-right" | "top-center">(
    "top-right",
  );
  const eventBus = useToastEvents();

  // Responsive position management
  useEffect(() => {
    const updatePosition = () => {
      setPosition(window.innerWidth <= 768 ? "top-center" : "top-right");
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, []);

  const removeToast = useCallback((toastId: string) => {
    setToasts((previousToasts) => {
      const updatedToasts = previousToasts.map((toast) => {
        if (toast.id === toastId) {
          return { ...toast, isExiting: true };
        }
        return toast;
      });
      return updatedToasts;
    });

    setTimeout(() => {
      setToasts((previousToasts) => {
        const remainingToasts = previousToasts.filter(
          (toast) => toast.id !== toastId,
        );
        return remainingToasts;
      });
    }, EXIT_ANIMATION_DURATION);
  }, []);

  // Add toast with auto-close timer
  const addToast = useCallback(
    (newToast: Toast) => {
      setToasts((previousToasts) => {
        const toastAlreadyExists = previousToasts.find(
          (toast) => toast.id === newToast.id,
        );

        if (toastAlreadyExists) {
          return previousToasts; // Prevent duplicates
        }

        return [...previousToasts, newToast];
      });

      if (newToast.autoClose !== false) {
        const autoCloseDuration =
          newToast.autoClose || DEFAULT_AUTO_CLOSE_DURATION;
        setTimeout(() => removeToast(newToast.id), autoCloseDuration);
      }
    },
    [removeToast],
  );

  // Update existing toast
  const updateToast = useCallback(
    (payload: { id: string; data: Record<string, unknown> }) => {
      setToasts((previousToasts) => {
        const updatedToasts = previousToasts.map((toast) => {
          if (toast.id === payload.id) {
            return {
              ...toast,
              data: { ...toast.data, ...payload.data },
            };
          }
          return toast;
        });
        return updatedToasts;
      });
    },
    [],
  );

  // Event bus listener
  useEffect(() => {
    if (!eventBus) return;

    const handleToastEvent = (e: Event) => {
      const { type, payload } = (e as CustomEvent).detail;

      switch (type) {
        case "add":
          addToast(payload as Toast);
          break;
        case "update":
          updateToast(payload);
          break;
        case "remove":
          removeToast(payload.id);
          break;
      }
    };

    eventBus.addEventListener("toast", handleToastEvent);
    return () => eventBus.removeEventListener("toast", handleToastEvent);
  }, [eventBus, addToast, updateToast, removeToast]);

  // Render toast content based on type
  const renderToastContent = (toast: Toast) => {
    switch (toast.data.type) {
      case "message":
        return (
          <ToastMessage
            message={toast.data.message}
            type={toast.data.messageType}
          />
        );
      case "file-transfer":
        return (
          <ToastFileTransfer
            fileName={toast.data.fileName}
            progress={toast.data.progress}
            isUploading={toast.data.isUploading}
            isFailed={toast.data.isFailed}
          />
        );
      case "file-received":
        return (
          <DownloadFileToast
            fileUrl={toast.data.fileUrl}
            fileName={toast.data.fileName}
            fileSize={toast.data.fileSize}
          />
        );
    }
  };

  return (
    <>
      {children}
      <div
        className={`fixed z-[9999] flex w-auto flex-col gap-2 md:w-96 ${POSITION_CLASSES[position]}`}
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <button
                onClick={() => removeToast(toast.id)}
                className="absolute -top-2 -left-2 z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-gray-700 text-gray-400 transition-colors hover:bg-gray-600"
                aria-label="Close notification"
              >
                <Icon.close />
              </button>
              <div className="border-primary-blue relative w-full overflow-hidden rounded-lg border-2 bg-gray-800 py-2">
                {renderToastContent(toast)}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
};
