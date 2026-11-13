"use client";
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import ToastMessage from "@/components/Toast/ToastMessage";
import ToastFileTransfer from "@/components/Toast/ToastFileTransfer";
import DownloadFileToast from "@/components/Toast/ToastDownloadFile";
import { useToastEvents } from "@/library/toastService";
import { getTruncatedFileName } from "@/utils/file.utils";

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
  data: ToastMessage | ToastFileTransfer | ToastFileReceived;
};

const DEFAULT_AUTO_CLOSE_DURATION = 5000;
const DESKTOP_MAX_TOASTS = 3;
const MOBILE_MAX_TOASTS = 2;

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [position, setPosition] = useState<"top-right" | "top-center">(
    "top-right",
  );
  const autoCloseTimers = useRef(
    new Map<string, ReturnType<typeof setTimeout>>(),
  );
  const eventBus = useToastEvents();

  useEffect(() => {
    const updatePosition = () => {
      setPosition(window.innerWidth <= 768 ? "top-center" : "top-right");
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, []);

  const removeToast = useCallback((toastId: string) => {
    const existingTimer = autoCloseTimers.current.get(toastId);
    if (existingTimer) {
      clearTimeout(existingTimer);
      autoCloseTimers.current.delete(toastId);
    }

    setToasts((previousToasts) =>
      previousToasts.filter((toast) => toast.id !== toastId),
    );
  }, []);

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
        const timerId = setTimeout(
          () => removeToast(newToast.id),
          autoCloseDuration,
        );
        autoCloseTimers.current.set(newToast.id, timerId);
      }
    },
    [removeToast],
  );

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

  useEffect(() => {
    const timers = autoCloseTimers.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

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

  const maxToasts =
    position === "top-center" ? MOBILE_MAX_TOASTS : DESKTOP_MAX_TOASTS;

  const renderToastContent = (toast: Toast, index: number): ReactNode => {
    switch (toast.data.type) {
      case "message":
        return (
          <ToastMessage
            message={toast.data.message}
            type={toast.data.messageType}
          />
        );
      case "file-transfer": {
        const { fileName, progress, isUploading, isFailed } = toast.data;
        if (isFailed) {
          return (
            <ToastMessage
              message={isUploading ? "Failed sending" : "Failed reception"}
              type="error"
              detail={getTruncatedFileName(fileName, 25).displayName}
            />
          );
        }
        // the service keeps a progress toast up to a second after its file is received
        const isReceived = toasts
          .slice(index + 1)
          .some(
            (later) =>
              later.data.type === "file-received" &&
              later.data.fileName === fileName,
          );
        if (isUploading || isReceived) {
          return null;
        }
        return <ToastFileTransfer fileName={fileName} progress={progress} />;
      }
      case "file-received":
        return (
          <DownloadFileToast
            fileUrl={toast.data.fileUrl}
            fileName={toast.data.fileName}
            fileSize={toast.data.fileSize}
            onDismiss={() => removeToast(toast.id)}
          />
        );
    }
  };

  const shownToasts = toasts
    .flatMap((toast, index) => {
      const content = renderToastContent(toast, index);
      return content ? [{ id: toast.id, content }] : [];
    })
    .slice(-maxToasts)
    .reverse();

  return (
    <>
      {children}
      <div
        role="status"
        className="pointer-events-none fixed top-3.5 right-6 z-9999 grid justify-items-end gap-3 max-md:top-2.5 max-md:right-3 max-md:left-3"
      >
        <AnimatePresence mode="popLayout">
          {shownToasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout="position"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="max-w-full"
            >
              {toast.content}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
};
