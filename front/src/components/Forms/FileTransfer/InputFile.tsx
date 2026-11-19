import { useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Icon from "@/components/Icons/Icon";
import BeaconButton from "@/components/ui/BeaconButton";

interface InputFileProps {
  onFilesSelected: (files: File[]) => void;
  onChoosingChange: (isChoosing: boolean) => void;
  disabled: boolean;
  hasNoRecipient: boolean;
  isDropTarget: boolean;
  label: string;
}

export default function InputFile({
  onFilesSelected,
  onChoosingChange,
  disabled,
  hasNoRecipient,
  isDropTarget,
  label,
}: InputFileProps) {
  // a file the Android picker returns after the last peer left must still reach onDrop
  const { getRootProps, getInputProps, inputRef } = useDropzone({
    onDrop: (files) => {
      onChoosingChange(false);
      onFilesSelected(files);
    },
    onFileDialogOpen: () => onChoosingChange(true),
    disabled,
    noClick: hasNoRecipient,
    noKeyboard: true,
    multiple: true,
  });

  // onFileDialogCancel fires on window focus, which Android gives back when a permission prompt closes, before the picker opens
  useEffect(() => {
    const input = inputRef.current;
    const endChoice = () => onChoosingChange(false);
    input?.addEventListener("cancel", endChoice);
    return () => input?.removeEventListener("cancel", endChoice);
  }, [inputRef, onChoosingChange]);

  return (
    <div {...getRootProps()}>
      <BeaconButton
        disabled={disabled}
        isUnavailable={hasNoRecipient}
        isRaised={isDropTarget}
      >
        <Icon.upload className="text-night size-5.5" />
        {label}
      </BeaconButton>

      <input {...getInputProps()} className="hidden" />
    </div>
  );
}
