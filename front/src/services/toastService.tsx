import { toast } from "sonner";
import ToastDownloadFile from "@/components/Toast/ToastDownloadFile";
import ToastFileTransfer from "@/components/Toast/ToastFileTransfer";
import ToastMessage from "@/components/Toast/ToastMessage";
import { useReceivedFilesStore } from "@/stores/useReceivedFilesStore";
import { NoticeLifetime, NoticeTone } from "@/types/toast.t";
import { getTruncatedFileName } from "@/utils/file.utils";
import { createRandomId } from "@/utils/random.utils";

const SHORT_NOTICE_MS = 5000;
const LONG_NOTICE_MS = 7000;

const noticeDuration = (lifetime: NoticeLifetime): number => {
  switch (lifetime) {
    case NoticeLifetime.SHORT:
      return SHORT_NOTICE_MS;
    case NoticeLifetime.LONG:
      return LONG_NOTICE_MS;
  }
};

const showNotice = (
  tone: NoticeTone,
  message: string,
  detail?: string,
  lifetime = NoticeLifetime.SHORT,
): void => {
  toast.custom(
    () => <ToastMessage tone={tone} message={message} detail={detail} />,
    { duration: noticeDuration(lifetime) },
  );
};

export const notify = {
  success: (message: string): void => showNotice(NoticeTone.SUCCESS, message),
  error: (message: string, detail?: string): void =>
    showNotice(NoticeTone.ERROR, message, detail),
  info: (message: string): void => showNotice(NoticeTone.INFO, message),
  warning: (message: string, lifetime?: NoticeLifetime): void =>
    showNotice(NoticeTone.WARNING, message, undefined, lifetime),
};

export const updateIncomingFile = (
  toastId: string,
  fileName: string,
  progress: number,
): void => {
  toast.custom(
    () => <ToastFileTransfer fileName={fileName} progress={progress} />,
    { id: toastId, duration: Infinity, dismissible: false },
  );
};

export const showIncomingFile = (fileName: string): string => {
  const toastId = createRandomId();
  updateIncomingFile(toastId, fileName, 0);
  return toastId;
};

export const showReceivedFile = (
  fileName: string,
  fileSize: number,
  fileUrl: string,
  toastId: string,
): void => {
  const { addFileToast, removeFileToast } = useReceivedFilesStore.getState();

  addFileToast(toastId);
  toast.custom(
    () => (
      <ToastDownloadFile
        fileUrl={fileUrl}
        fileName={fileName}
        fileSize={fileSize}
        onDismiss={() => toast.dismiss(toastId)}
      />
    ),
    {
      id: toastId,
      duration: Infinity,
      dismissible: true,
      onDismiss: () => removeFileToast(toastId),
    },
  );
};

export const dismissToast = (toastId: string): void => {
  toast.dismiss(toastId);
};

export const dismissReceivedFiles = (): void => {
  useReceivedFilesStore.getState().fileToastIds.forEach(dismissToast);
};

export const failIncomingFile = (toastId: string, fileName: string): void => {
  dismissToast(toastId);
  notify.error("Failed reception", getTruncatedFileName(fileName).displayName);
};
