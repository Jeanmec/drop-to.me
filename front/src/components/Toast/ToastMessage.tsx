type ToastmessageType = "success" | "error" | "info" | "warning";

import { cn } from "@/library/utils";
import { Icon } from "@/components/Icons/Icon";
import Pennon from "@/components/ui/Pennon";

interface ToastMessageProps {
  message: string;
  type: ToastmessageType;
  detail?: string;
}

const isProblem = (type: ToastmessageType): boolean => {
  switch (type) {
    case "error":
    case "warning":
      return true;
    case "success":
    case "info":
      return false;
  }
};

export default function ToastMessage({
  message,
  type,
  detail,
}: ToastMessageProps) {
  const tint = isProblem(type) ? "text-alert" : "text-moon";

  return (
    <Pennon
      tone={isProblem(type) ? "alert" : "moon"}
      className="pointer-events-auto flex max-w-85 items-center gap-2.5 py-2.5 pr-7 pl-3.5 text-base leading-snug"
    >
      <span className={cn("shrink-0 text-lg", tint)}>
        {type === "error" ? (
          <Icon.exclamation className={tint} />
        ) : type === "success" ? (
          <Icon.check className={tint} />
        ) : type === "info" ? (
          <Icon.information className={tint} />
        ) : type === "warning" ? (
          <Icon.warning className={tint} />
        ) : null}
      </span>
      <span className="min-w-0 wrap-anywhere">
        {message}
        {detail && (
          <span className="text-ash block font-mono text-xs">{detail}</span>
        )}
      </span>
    </Pennon>
  );
}
