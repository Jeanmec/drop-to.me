import { z } from "zod";
import { usePeersStore } from "@/stores/usePeersStore";
import { useChatStore } from "@/stores/useChatStore";
import type { Message } from "@/types/message.t";
import type { DataConnection } from "peerjs";

const FileDataSchema = z.object({
  type: z.literal("file"),
  fileId: z.string(),
  name: z.string(),
  size: z.number(),
  content: z.instanceof(Uint8Array),
});

const MessageDataSchema = z.object({
  type: z.literal("message"),
  ackId: z.string(),
  received: z.boolean(),
  content: z.string(),
});

const AckSchema = z.object({
  type: z.literal("ack"),
  ackId: z.string(),
});

export interface ReceivedFile {
  id: string;
  name: string;
  size: number;
  data: Blob;
}

type OnFileReceivedCallback = (file: ReceivedFile) => void;
type OnMessageReceivedCallback = (message: Message) => void;

class PeerService {
  private onFileReceivedCallbacks = new Map<string, OnFileReceivedCallback>();
  private onMessageReceivedCallbacks = new Map<
    string,
    OnMessageReceivedCallback
  >();

  private pendingAcks = new Map<
    string,
    { peerId: string; timestamp: number }
  >();

  public setOnFileReceivedCallback(
    callback: OnFileReceivedCallback,
    id = "default",
  ) {
    this.onFileReceivedCallbacks.set(id, callback);
  }

  public setOnMessageReceivedCallback(
    callback: OnMessageReceivedCallback,
    id = "default",
  ) {
    this.onMessageReceivedCallbacks.set(id, callback);
  }

  private getConnectionByPeerId(peerId: string): DataConnection | undefined {
    const peer = usePeersStore
      .getState()
      .targetPeers.find((p) => p.peerId === peerId);
    return peer?.connection ?? undefined;
  }

  private generateMessageId(content: string): string {
    return `${content}-${Date.now()}`;
  }

  public handleIncomingData(data: unknown, peerId: string): void {
    const conn = this.getConnectionByPeerId(peerId);
    console.log(`[PeerService] Donnée reçue de ${peerId}`);

    const fileParsed = FileDataSchema.safeParse(data);
    if (fileParsed.success) {
      const { fileId, name, content, size } = fileParsed.data;
      const blob = new Blob([content]);
      const receivedFile: ReceivedFile = { id: fileId, name, data: blob, size };
      this.onFileReceivedCallbacks.forEach((cb) => cb(receivedFile));
      void conn?.send({ type: "ack", ackId: fileId });
      return;
    }

    const messageParsed = MessageDataSchema.safeParse(data);
    if (messageParsed.success) {
      const { received, content, ackId } = messageParsed.data;
      const receivedMessage: Message = {
        received,
        content,
        timestamp: new Date(),
      };
      this.onMessageReceivedCallbacks.forEach((cb) => cb(receivedMessage));
      void conn?.send({ type: "ack", ackId });
      useChatStore.getState().addMessage(receivedMessage);
      return;
    }

    const ackParsed = AckSchema.safeParse(data);
    if (ackParsed.success) {
      const { ackId } = ackParsed.data;
      const ackInfo = this.pendingAcks.get(ackId);
      if (ackInfo) {
        usePeersStore.getState().updatePeerState(ackInfo.peerId, "delivered");
        console.log(
          `[PeerService] ACK reçu de ${ackInfo.peerId} pour ${ackId}`,
        );
        this.pendingAcks.delete(ackId);
      } else {
        console.warn(`[PeerService] ACK inconnu ou déjà traité : ${ackId}`);
      }
      return;
    }

    console.warn("[PeerService] Donnée reçue invalide:", data);
  }

  public async sendFileToTargets(file: File): Promise<void> {
    const { targetPeers } = usePeersStore.getState();

    if (targetPeers.length === 0) {
      console.warn("[PeerService] Aucun peer cible pour l'envoi du fichier.");
      return;
    }

    const buffer = new Uint8Array(await file.arrayBuffer());

    for (const target of targetPeers) {
      const conn = target.connection;
      if (!conn?.open) {
        console.warn(
          `[PeerService] Connexion vers ${target.peerId} fermée (état: ${target.state})`,
        );
        continue;
      }

      usePeersStore.getState().updatePeerState(target.peerId, "sending");

      const fileId = `${target.peerId}-${Date.now()}`;
      const payload = {
        fileId,
        type: "file" as const,
        name: file.name,
        size: file.size,
        content: buffer,
      };

      try {
        this.pendingAcks.set(fileId, {
          peerId: target.peerId,
          timestamp: Date.now(),
        });
        void conn.send(payload);
      } catch (err) {
        console.error(`[PeerService]`, err);
      }
    }
  }

  public async sendMessageToTargets(content: string): Promise<void> {
    const { targetPeers } = usePeersStore.getState();

    if (targetPeers.length === 0) {
      console.warn("[PeerService] Aucun peer cible pour l'envoi du message.");
      return;
    }

    for (const target of targetPeers) {
      const conn = target.connection;
      if (!conn?.open) {
        console.warn(
          `[PeerService] Connexion vers ${target.peerId} fermée (état: ${target.state})`,
        );
        continue;
      }

      const ackId = this.generateMessageId(content);
      const payload = {
        type: "message" as const,
        ackId,
        received: true,
        content,
      };

      try {
        this.pendingAcks.set(ackId, {
          peerId: target.peerId,
          timestamp: Date.now(),
        });
        void conn.send(payload);
        console.log(`[PeerService] Message envoyé à ${target.peerId}`);
      } catch (err) {
        console.error(
          `[PeerService] Erreur lors de l'envoi à ${target.peerId}`,
          err,
        );
      }
    }
  }
}

export const peerService = new PeerService();
