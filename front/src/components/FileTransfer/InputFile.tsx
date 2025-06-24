import { useRef } from "react";
import { HiOutlineUpload } from "react-icons/hi";

interface InputFileProps {
  callback?: (file: File | null) => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export default function InputFile({
  callback,
  disabled,
  icon,
}: InputFileProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    callback?.(file);
    if (file) {
      console.log("Selected file:", file);
    } else {
      console.log("No file selected");
    }
  };

  const handleFileSelection = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  return (
    <div>
      <button
        onClick={handleFileSelection}
        disabled={disabled}
        className="text-shadow border-primary-blue text-primary-blue custom-blue-shadow-hover custom-blue-shadow relative m-8 flex h-36 w-36 cursor-pointer items-center justify-center rounded-full border-[0.125em] border-solid bg-black px-4 py-2 text-base no-underline transition-all duration-200"
      >
        {icon ?? <HiOutlineUpload className="h-8 w-8" />}
      </button>
      <input
        className="hidden"
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
      />
    </div>
  );
}
