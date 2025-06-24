type ToastmessageType = "success" | "error" | "info" | "warning";

import {
  FaCheck,
  FaExclamation,
  FaInfo,
  FaTriangleExclamation,
} from "react-icons/fa6";

import { cn } from "@/library/utils";

export default function ToastMessage({
  message,
  type,
}: {
  message: string;
  type: ToastmessageType;
}) {
  return (
    <div className="flex items-center gap-3 px-4">
      <div
        className={cn(
          `mr-2 flex items-center justify-center rounded-full p-2 text-xl text-white`,
          {
            "bg-primary-blue": type === "success",
            "bg-red-500": type === "error",
            "bg-secondary-blue": type === "info",
            "bg-yellow-500": type === "warning",
          },
        )}
      >
        {type === "error" ? (
          <FaExclamation />
        ) : type === "success" ? (
          <FaCheck />
        ) : type === "info" ? (
          <FaInfo />
        ) : type === "warning" ? (
          <FaTriangleExclamation />
        ) : null}
      </div>
      <span className="text-white">{message}</span>
    </div>
  );
}
