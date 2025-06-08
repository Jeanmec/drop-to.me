// src/services/peerService.ts
import { z } from "zod";
import { usePeersStore } from "@/stores/usePeersStore";

const FileDataSchema = z.object({
  type: z.literal("file"),
  fileId: z.string(),
  name: z.string(),
  content: z.instanceof(Uint8Array), // PeerJS gère bien les Uint8Array
});

export interface ReceivedFile {
  id: string;
  name: string;
  data: Blob;
}

type OnFileReceivedCallback = (file: ReceivedFile) => void;

class PeerService {
  private onFileReceivedCallbacks = new Map<string, OnFileReceivedCallback>();

  public setOnFileReceivedCallback(
    callback: OnFileReceivedCallback,
    id = "default",
  ) {
    this.onFileReceivedCallbacks.set(id, callback);
  }

  // Méthode appelée par le PeerProvider lorsqu'une donnée est reçue
  public handleIncomingData(data: unknown, peerId: string): void {
    console.log(`[PeerService] Donnée reçue de ${peerId}`);
    const parsed = FileDataSchema.safeParse(data);

    if (!parsed.success) {
      console.warn("[PeerService] Donnée reçue invalide:", parsed.error);
      return;
    }

    const { fileId, name, content } = parsed.data;
    const blob = new Blob([content]);
    const receivedFile: ReceivedFile = { id: fileId, name, data: blob };

    this.onFileReceivedCallbacks.forEach((cb) => cb(receivedFile));
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
}

export const peerService = new PeerService();
