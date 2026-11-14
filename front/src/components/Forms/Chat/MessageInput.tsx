import { useState, type FormEvent } from "react";
import Icon from "@/components/Icons/Icon";
import { sendMessageToTargets } from "@/services/peer/chatMessenger";
import { selectHasReachablePeer, usePeersStore } from "@/stores/usePeersStore";
import {
  selectIsReconnecting,
  useSessionStore,
} from "@/stores/useSessionStore";

export default function MessageInput() {
  const [message, setMessage] = useState("");
  const isAlone = usePeersStore((state) => state.targetPeers.length === 0);
  const canSend = usePeersStore(selectHasReachablePeer);
  const isReconnecting = useSessionStore(selectIsReconnecting);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = message.trim();
    if (content && sendMessageToTargets(content)) {
      setMessage("");
    }
  };

  if (!canSend) {
    return (
      <p
        role="status"
        className="border-cream text-ash grid h-13.5 place-items-center border-t px-4 text-center font-mono text-xs"
      >
        {isAlone && !isReconnecting
          ? "Can't send messages while alone."
          : "Waiting for reconnection..."}
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-cream flex items-center gap-2.5 border-t px-3 py-2.5"
    >
      <input
        type="text"
        className="border-ash placeholder:text-ash/75 h-11 min-w-0 flex-1 border-b bg-transparent px-0.5"
        placeholder="Your message here"
        aria-label="Message"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      <button
        type="submit"
        aria-label="Send message"
        className="bg-moon grid size-11 shrink-0 cursor-pointer place-items-center rounded-full"
      >
        <Icon.send className="text-night size-5" />
      </button>
    </form>
  );
}
