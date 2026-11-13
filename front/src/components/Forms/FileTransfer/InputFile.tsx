import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Icon } from "@/components/Icons/Icon";
import BeaconButton from "@/components/ui/BeaconButton";

interface InputFileProps {
  callback?: (files: File[] | null) => void;
  disabled?: boolean;
  hasNoRecipient?: boolean;
  isDropTarget?: boolean;
  label: string;
}

export default function InputFile({
  callback,
  disabled,
  hasNoRecipient,
  isDropTarget,
  label,
}: InputFileProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      callback?.(acceptedFiles.length > 0 ? acceptedFiles : null);
    },
    [callback],
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    disabled,
    noKeyboard: true,
    multiple: true,
  });

  return (
    <div {...getRootProps()}>
      <BeaconButton
        disabled={disabled || hasNoRecipient}
        isRaised={isDropTarget}
      >
        <Icon.upload className="text-night size-5.5" />
        {label}
      </BeaconButton>

      <input {...getInputProps()} className="hidden" />
    </div>
  );
}
