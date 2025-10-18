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
    <div className="border-secondary-blue flex h-20 h-fit min-h-[5rem] w-[75vw] items-center justify-center rounded-md border bg-stone-800 !px-2 !py-0">
      <div className="absolute -top-3 -left-3 md:-top-2 md:-left-2">
        <button
          onClick={closeToast}
          className="custom-primary-shadow flex h-fit w-fit cursor-pointer items-center justify-center rounded-full bg-stone-700"
          aria-label="Close notification"
        >
          <Icon.close className="h-8 w-8 text-slate-100 md:h-6 md:w-6" />
        </button>
      </div>
      {children}
    </div>
  );
}
