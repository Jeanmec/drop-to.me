import type { ToastContentProps } from "react-toastify";
import { Icon } from "@/components/Icons/Icon";

interface ToastCustomContainerProps extends ToastContentProps {
  children: React.ReactNode;
}

export default function ToastCustomContainer({
  children,
  closeToast,
}: ToastCustomContainerProps) {
  return (
    <div className="border-secondary-blue relative flex h-20 w-full rounded-md border bg-stone-800 shadow-[0_0px_25px_rgba(8,112,184,0.75)]">
      <div className="absolute -top-3 -left-3 md:-top-2 md:-left-2">
        <button
          onClick={closeToast}
          className="flex h-fit w-fit items-center justify-center"
          aria-label="Close notification"
        >
          <Icon.close className="text-primary-blue h-8 w-8 cursor-pointer rounded-full bg-stone-700 md:h-6 md:w-6" />
        </button>
      </div>
      {children}
    </div>
  );
}
