import clsx from "clsx";
import Icon from "@/components/Icons/Icon";

interface CloseButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
}

export default function CloseButton({
  label,
  onClick,
  className,
}: CloseButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={clsx(
        "text-ash hover:text-moon grid size-11 cursor-pointer place-items-center",
        className,
      )}
    >
      <Icon.close className="size-5" />
    </button>
  );
}
