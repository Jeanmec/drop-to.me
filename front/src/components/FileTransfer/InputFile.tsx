import { useRef } from "react";

export default function InputFile() {
  const file = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Selected file:", file);
    } else {
      console.log("No file selected");
    }
  };

  const handleFileSelection = () => {
    if (file.current) {
      file.current.click();
    }
  };
  return (
    <div>
      <button
        className="w-52 rounded-full bg-amber-700"
        onClick={handleFileSelection}
      >
        send
      </button>
      <input
        className="hidden"
        ref={file}
        type="file"
        onChange={handleFileChange}
      />
    </div>
  );
}
