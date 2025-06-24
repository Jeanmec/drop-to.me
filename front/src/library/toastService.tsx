import {
  toast,
  ToastContainer,
  type ToastOptions,
  type ToastContentProps,
} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DownloadFileToast from "@/components/Toast/ToastDownloadFile";
import ToastCustomContainer from "@/components/Toast/ToastCustomContainer";
import ToastMessage from "@/components/Toast/ToastMessage";
import { type ToastFileTransfer } from "@/types/file.t";

const defaultOptions: ToastOptions = {
  closeButton: false,
  className: "!p-0 !bg-transparent border-none",
  ariaLabel: "File received",
  autoClose: 5000,
  hideProgressBar: true,
};

type ToastType = "success" | "error" | "info" | "warning";

const toastMessage = (type: ToastType, message: string) => {
  toast(
    (props: ToastContentProps) => (
      <ToastCustomContainer {...props}>
        <ToastMessage message={message} type={type} />
      </ToastCustomContainer>
    ),
    { ...defaultOptions },
  );
};

const notify = {
  success: (message: string) => toastMessage("success", message),
  error: (message: string) => toastMessage("error", message),
  info: (message: string) => toastMessage("info", message),
  warning: (message: string) => toastMessage("warning", message),

  receivedFile: ({ fileUrl, fileName, fileSize }: ToastFileTransfer) =>
    toast(
      (props: ToastContentProps) => (
        <ToastCustomContainer {...props}>
          <DownloadFileToast
            fileUrl={fileUrl}
            fileName={fileName}
            fileSize={fileSize}
          />
        </ToastCustomContainer>
      ),
      { ...defaultOptions, autoClose: false },
    ),
};

const ToastService = () => <ToastContainer />;

export { notify, ToastService };
