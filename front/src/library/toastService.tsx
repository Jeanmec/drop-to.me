"use client";
import { type ToastFileTransfer as ToastFileTransferType } from "@/types/file.t";

export type ToastId = string;
export type ToastType = "success" | "error" | "info" | "warning";

type MessageToastOptions = {
  message: string;
  autoClose?: number | false;
  customId?: string;
};

const toastEventBus = typeof window !== "undefined" ? new EventTarget() : null;

const emit = (
  type: "add" | "update" | "remove",
  payload: Record<string, unknown>,
) => {
  toastEventBus?.dispatchEvent(
    new CustomEvent("toast", { detail: { type, payload } }),
  );
};

const generateId = (customId?: string): ToastId => {
  return customId || `toast-${Date.now()}-${Math.random()}`;
};

const createMessageToast = (
  messageType: ToastType,
  { message, autoClose = 5000, customId }: MessageToastOptions,
): ToastId => {
  const id = generateId(customId);
  emit("add", {
    id,
    data: { type: "message", messageType, message },
    autoClose,
  });
  return id;
};

const createFileTransferToast = (
  fileName: string,
  isUploading: boolean,
): ToastId => {
  const id = generateId();
  emit("add", {
    id,
    data: { type: "file-transfer", fileName, progress: 0, isUploading },
    autoClose: false,
  });
  return id;
};

type MessageToastParams = [
  message: string,
  autoClose?: number | false,
  customId?: string,
];

export const notify = {
  success: (
    ...[message, autoClose = 5000, customId]: MessageToastParams
  ): ToastId => createMessageToast("success", { message, autoClose, customId }),

  error: (
    ...[message, autoClose = 5000, customId]: MessageToastParams
  ): ToastId => createMessageToast("error", { message, autoClose, customId }),

  info: (
    ...[message, autoClose = 5000, customId]: MessageToastParams
  ): ToastId => createMessageToast("info", { message, autoClose, customId }),

  warning: (
    ...[message, autoClose = 5000, customId]: MessageToastParams
  ): ToastId => createMessageToast("warning", { message, autoClose, customId }),

  receivedFile: ({
    fileUrl,
    fileName,
    fileSize,
  }: ToastFileTransferType): ToastId => {
    const id = generateId();
    emit("add", {
      id,
      data: { type: "file-received", fileUrl, fileName, fileSize },
      autoClose: false,
    });
    return id;
  },

  sendingFile: (fileName: string): ToastId =>
    createFileTransferToast(fileName, true),

  receivingFile: (fileName: string): ToastId =>
    createFileTransferToast(fileName, false),

  updateProgress: (
    toastId: ToastId,
    fileName: string,
    progress: number,
    isUploading: boolean,
  ): void => {
    emit("update", { id: toastId, data: { fileName, progress, isUploading } });
  },

  updateToFailed: (
    toastId: ToastId,
    fileName: string,
    isUploading: boolean,
  ): void => {
    emit("update", {
      id: toastId,
      data: { fileName, progress: 0, isUploading, isFailed: true },
    });
    setTimeout(() => {
      emit("remove", { id: toastId });
    }, 5000);
  },

  dismiss: (toastId: ToastId): void => {
    emit("remove", { id: toastId });
  },
};

export const useToastEvents = () => toastEventBus;
