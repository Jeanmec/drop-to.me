export default function Chat() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex w-full max-w-2xl flex-col items-center justify-center gap-4 p-4">
        <h1 className="text-2xl font-bold">Chat</h1>
        <p className="text-center text-gray-500">
          Use the input below to send a message.
        </p>
        <input
          type="text"
          placeholder="Type your message here..."
          className="input input-bordered input-primary w-full max-w-xs"
        />
      </div>
    </div>
  );
}
