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

const toastMessage = (
  type: ToastType,
  message: string,
  options?: ToastOptions,
) => {
  toast(
    (props: ToastContentProps) => (
      <ToastCustomContainer {...props}>
        <ToastMessage message={message} type={type} />
      </ToastCustomContainer>
    ),
    { ...defaultOptions, ...options },
  );
};

const notify = {
  success: (message: string, options: ToastOptions = {}) =>
    toastMessage("success", message, options),
  error: (message: string, options: ToastOptions = {}) =>
    toastMessage("error", message, options),
  info: (message: string, options: ToastOptions = {}) =>
    toastMessage("info", message, options),
  warning: (message: string, options: ToastOptions = {}) =>
    toastMessage("warning", message, options),

  receivedFile: ({ fileUrl, fileName, fileSize }: ToastFileTransfer) =>
    toast(
      (props: ToastContentProps) => (
        <div className="w-full px-4">
          <ToastCustomContainer {...props}>
            <DownloadFileToast
              fileUrl={fileUrl}
              fileName={fileName}
              fileSize={fileSize}
            />
          </ToastCustomContainer>
        </div>
      ),
      { ...defaultOptions, autoClose: false },
    ),
};

const ToastService = () => <ToastContainer />;

export { notify, ToastService };
