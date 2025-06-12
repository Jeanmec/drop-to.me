// src/services/peerService.ts
import { z } from "zod";
import { usePeersStore } from "@/stores/usePeersStore";
import type { Message } from "@/app/types/message.t";

const FileDataSchema = z.object({
  type: z.literal("file"),
  fileId: z.string(),
  name: z.string(),
  content: z.instanceof(Uint8Array),
});

const MessageDataSchema = z.object({
  type: z.literal("message"),
  received: z.boolean(),
  content: z.string(),
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

  public handleIncomingData(data: unknown, peerId: string): void {
    console.log(`[PeerService] Donnée reçue de ${peerId}`);

    const fileParsed = FileDataSchema.safeParse(data);
    if (fileParsed.success) {
      const { fileId, name, content } = fileParsed.data;
      const blob = new Blob([content]);
      const receivedFile: ReceivedFile = { id: fileId, name, data: blob };
      this.onFileReceivedCallbacks.forEach((cb) => cb(receivedFile));
      return;
    }

    console.log({ data });
    const messageParsed = MessageDataSchema.safeParse(data);
    if (messageParsed.success) {
      const { received, content } = messageParsed.data;
      console.log(`[PeerService] Message reçu de ${peerId}:`, content);
      const receivedMessage: Message = {
        received,
        content,
        timestamp: new Date(),
      };
      this.onMessageReceivedCallbacks.forEach((cb) => cb(receivedMessage));
      return;
    }

    console.warn("[PeerService] Donnée reçue invalide:", data);
  }

  public async sendFileToTargets(file: File): Promise<void> {
    const targetPeers = usePeersStore.getState().targetPeers;

    if (targetPeers.length === 0) {
      console.warn("[PeerService] Aucun peer cible pour l'envoi du fichier.");
      return;
    }

    const buffer = new Uint8Array(await file.arrayBuffer());

    for (const target of targetPeers) {
      if (!target.connection?.open) {
        console.warn(
          `[PeerService] La connexion vers ${target.peerId} n'est pas ouverte. État: ${target.state}.`,
        );
        continue;
      }

      const payload = {
        type: "file" as const,
        name: file.name,
        fileId: `${target.peerId}-${Date.now()}`,
        content: buffer,
      };

      try {
        await target.connection.send(payload);
        console.log(`[PeerService] Fichier envoyé à ${target.peerId}`);
      } catch (err) {
        console.error(
          `[PeerService] Erreur lors de l'envoi du fichier à ${target.peerId}`,
          err,
        );
      }
    }
  }

  public async sendMessageToTargets(content: string): Promise<void> {
    const targetPeers = usePeersStore.getState().targetPeers;

    if (targetPeers.length === 0) {
      console.warn("[PeerService] Aucun peer cible pour l'envoi du message.");
      return;
    }

    for (const target of targetPeers) {
      if (!target.connection?.open) {
        console.warn(
          `[PeerService] La connexion vers ${target.peerId} n'est pas ouverte. État: ${target.state}.`,
        );
        continue;
      }

      const payload = {
        type: "message" as const,
        received: true,
        content,
        timestamp: new Date().toISOString(),
      };

      try {
        await target.connection.send(payload);
        console.log(`[PeerService] Message envoyé à ${target.peerId}`);
      } catch (err) {
        console.error(
          `[PeerService] Erreur lors de l'envoi du message à ${target.peerId}`,
          err,
        );
      }
    }
  }
}

export const peerService = new PeerService();
