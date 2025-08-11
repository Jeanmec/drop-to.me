type ToastmessageType = "success" | "error" | "info" | "warning";

import { cn } from "@/library/utils";
import { Icon } from "@/components/Icons/Icon";

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
          <Icon.exclamation />
        ) : type === "success" ? (
          <Icon.check />
        ) : type === "info" ? (
          <Icon.information />
        ) : type === "warning" ? (
          <Icon.warning />
        ) : null}
      </div>
      <span className="text-white">{message}</span>
    </div>
  );
}
