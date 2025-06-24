import { useLoadingStore } from "@/stores/useLoadingStore";
import Messages from "./Chat/Messages";
import MessageInput from "./Chat/MessageInput";

export default function Chat() {
  const { isLoading } = useLoadingStore();

  return (
    <div className="animate-fade-in-left z-[1] flex h-96 min-h-24 w-[500px] flex-1 flex-col items-center justify-end overflow-auto px-8">
      <Messages />
      <MessageInput />
    </div>
  );
}
