import { notify } from "@/library/toastService";
import { useChatStore } from "@/stores/useChatStore";

export default function Messages() {
  const { messages } = useChatStore();

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        notify.success("Text copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        notify.error("Failed to copy text.");
      });
  };

  return (
    <div className="flex h-72 w-full flex-col justify-end overflow-auto px-5">
      {messages?.length > 0 &&
        messages.map((msg, index) => (
          <div
            className={`chat ${msg.received ? "chat-start" : "chat-end"}`}
            key={index}
          >
            <div className="chat-header">
              <time className="text-xs opacity-50">
                {msg.timestamp.toLocaleTimeString()}
              </time>
            </div>
            <div
              onClick={() => copyToClipboard(msg.content)}
              className={`chat-bubble animate-bounce-fade-in cursor-pointer rounded-lg ${msg.received ? "bg-primary-blue" : "bg-secondary-blue"}`}
            >
              {msg.content}
            </div>
          </div>
        ))}
    </div>
  );
}
