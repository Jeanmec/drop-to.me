import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/library/utils";
import { Icon } from "@/components/Icons/Icon";

interface InputFileProps {
  callback?: (file: File | null) => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export default function InputFile({
  callback,
  disabled,
  icon,
  className,
}: InputFileProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0] ?? null;
      callback?.(file);
    },
    [callback],
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    disabled,
    noKeyboard: true,
  });

  return (
    <div {...getRootProps()}>
      <button
        type="button"
        disabled={disabled}
        className={cn(
          "text-shadow border-primary-blue text-primary-blue custom-blue-shadow-hover custom-blue-shadow relative m-8 flex h-36 w-36 cursor-pointer items-center justify-center rounded-full border-[0.125em] border-solid bg-black px-4 py-2 text-base no-underline transition-all duration-200 hover:scale-110",
          className,
        )}
      >
        {icon ?? <Icon.upload className="h-8 w-8" />}
      </button>

      <input {...getInputProps()} className="hidden" />
    </div>
  );
}
