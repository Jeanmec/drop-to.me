export default function FileTransfer() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex w-full max-w-2xl flex-col items-center justify-center gap-4 p-4">
        <h1 className="text-2xl font-bold">File Transfer</h1>
        <p className="text-center text-gray-500">
          Use the input below to select a file to transfer.
        </p>
        <input
          type="file"
          className="file-input file-input-bordered file-input-primary w-full max-w-xs"
        />
      </div>
    </div>
  );
}
