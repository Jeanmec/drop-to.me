// src/services/peerService.ts
import { z } from "zod";
import { usePeersStore } from "@/stores/usePeersStore";
import { useChatStore } from "@/stores/useChatStore";
import type { Message } from "@/app/types/message.t";
import type { DataConnection } from "peerjs";

const FileDataSchema = z.object({
  type: z.literal("file"),
  fileId: z.string(),
  name: z.string(),
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

  // ackId => { peerId, timestamp }
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
    return usePeersStore.getState().targetPeers.find((p) => p.peerId === peerId)
      ?.connection;
  }

  private generateMessageId(content: string): string {
    return `${content}-${Date.now()}`;
  }

  public handleIncomingData(data: unknown, peerId: string): void {
    const conn = this.getConnectionByPeerId(peerId);
    console.log(`[PeerService] Donnée reçue de ${peerId}`);

    const fileParsed = FileDataSchema.safeParse(data);
    if (fileParsed.success) {
      const { fileId, name, content } = fileParsed.data;
      const blob = new Blob([content]);
      const receivedFile: ReceivedFile = { id: fileId, name, data: blob };
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
      void conn?.send({ type: "ack", ackId }); // Envoi de l'ack avec le même ackId reçu
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
        type: "file" as const,
        name: file.name,
        fileId,
        content: buffer,
      };

      try {
        this.pendingAcks.set(fileId, {
          peerId: target.peerId,
          timestamp: Date.now(),
        });
        void conn.send(payload);
        console.log(`[PeerService] Fichier envoyé à ${target.peerId}`);
      } catch (err) {
        console.error(
          `[PeerService] Erreur lors de l'envoi à ${target.peerId}`,
          err,
        );
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
