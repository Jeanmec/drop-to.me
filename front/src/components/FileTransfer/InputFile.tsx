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
        className="text-shadow relative m-8 flex h-36 w-36 cursor-pointer items-center justify-center rounded-full border-[0.125em] border-solid border-[rgb(16,185,129)] bg-black px-4 py-2 text-base text-[rgb(16,185,129)] no-underline shadow-[inset_0_0_0.5em_0_rgb(16,185,129),_0_0_0.5em_0_rgb(16,185,129)] transition-all [text-shadow:0_0_0.125em_hsl(0_0%_100%_/_0.3),_0_0_0.45em_rgb(16,185,129)] hover:border-4 hover:shadow-[inset_0_0_0.5em_0_rgb(16,185,129),_0_0_0.5em_0_rgb(16,185,129),_0_0_1em_0_rgb(16,185,129)] disabled:hover:shadow-[inset_0_0_0.5em_0_rgb(16,185,129),_0_0_0.5em_0_rgb(16,185,129)]"
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
