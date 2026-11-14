import clsx from "clsx";
import type { ReactNode } from "react";
import Icon from "@/components/Icons/Icon";
import Pennon from "@/components/ui/Pennon";
import { NoticeTone } from "@/types/toast.t";
import { PennonTone } from "@/types/ui.t";

interface ToastMessageProps {
  tone: NoticeTone;
  message: string;
  detail?: string;
}

const isProblem = (tone: NoticeTone): boolean => {
  switch (tone) {
    case NoticeTone.ERROR:
    case NoticeTone.WARNING:
      return true;
    case NoticeTone.SUCCESS:
    case NoticeTone.INFO:
      return false;
  }
};

const renderToneIcon = (tone: NoticeTone): ReactNode => {
  switch (tone) {
    case NoticeTone.SUCCESS:
      return <Icon.check />;
    case NoticeTone.ERROR:
      return <Icon.exclamation />;
    case NoticeTone.INFO:
      return <Icon.information />;
    case NoticeTone.WARNING:
      return <Icon.warning />;
  }
};

export default function ToastMessage({
  tone,
  message,
  detail,
}: ToastMessageProps) {
  const hasProblem = isProblem(tone);

  return (
    <Pennon
      tone={hasProblem ? PennonTone.ALERT : PennonTone.MOON}
      className="ml-auto flex w-fit max-w-85 items-center gap-2.5 py-2.5 pr-7 pl-3.5 font-serif text-base leading-snug"
    >
      <span
        className={clsx(
          "shrink-0 text-lg",
          hasProblem ? "text-alert" : "text-moon",
        )}
      >
        {renderToneIcon(tone)}
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
