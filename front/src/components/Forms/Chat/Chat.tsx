import Messages from "./Messages";
import MessageInput from "./MessageInput";

export default function Chat() {
  return (
    <div className="animate-fade-in-left z-[1] mb-2 flex h-96 min-h-24 w-9/12 flex-1 flex-col items-center justify-end gap-4 rounded-xl border-1 border-gray-600 px-12 py-4 backdrop-blur-xs">
      <Messages />
      <MessageInput />
    </div>
  );
}
