import { type DataConnection } from "peerjs";
import type Peer from "peerjs";
import { z } from "zod";

export interface ReceivedFile {
  id: string;
  name: string;
  data: Blob;
}

type FileData = {
  type: "file";
  fileId: string;
  name: string;
  content: ArrayBuffer | Uint8Array | string; // string au cas où, mais tu peux affiner
};

const FileDataSchema = z.object({
  type: z.literal("file"),
  fileId: z.string(),
  name: z.string(),
  content: z.union([
    z.string(),
    z.instanceof(ArrayBuffer),
    z.instanceof(Uint8Array),
  ]),
});

type OnFileReceivedCallback = (file: ReceivedFile) => void;

export class PeerService {
  private peer: Peer;
  private connections: Record<string, DataConnection> = {};
  private onFileReceived?: OnFileReceivedCallback;

  constructor(peer: Peer) {
    this.peer = peer;

    this.peer.on("connection", (conn) => {
      this.setupConnectionHandlers(conn);
    });
  }

  setOnFileReceivedCallback(callback: OnFileReceivedCallback) {
    this.onFileReceived = callback;
  }

  connectToPeer(peerId: string): void {
    if (this.connections[peerId]) return;

    const conn = this.peer.connect(peerId);

    conn.on("open", () => {
      console.log("[PeerService] Connexion ouverte avec", peerId);
    });

    this.setupConnectionHandlers(conn);

    this.connections[peerId] = conn;
  }

  private setupConnectionHandlers(conn: DataConnection): void {
    conn.on("data", (data: unknown) => {
      const parsed = FileDataSchema.safeParse(data);
      if (!parsed.success) {
        console.warn("Données reçues non conformes :", data);
        return;
      }
      const fileData = data as FileData;

      let uint8Array: Uint8Array;

      if (fileData.content instanceof ArrayBuffer) {
        uint8Array = new Uint8Array(fileData.content);
      } else if (fileData.content instanceof Uint8Array) {
        uint8Array = fileData.content;
      } else if (
        typeof fileData.content === "object" &&
        fileData.content !== null
      ) {
        uint8Array = new Uint8Array(Object.values(fileData.content));
      } else {
        console.warn(
          "[PeerService] Format contenu fichier non reconnu",
          fileData.content,
        );
        return;
      }

      const blob = new Blob([uint8Array]);

      if (this.onFileReceived) {
        this.onFileReceived({
          id: fileData.fileId,
          name: fileData.name,
          data: blob,
        });
      }
    });

    conn.on("close", () => {
      console.log("[PeerService] Connexion fermée avec", conn.peer);
      delete this.connections[conn.peer];
    });

    conn.on("error", (err) => {
      console.error("[PeerService] Erreur connexion avec", conn.peer, err);
    });
  }

  sendFileToPeer(peerId: string, file: File): void {
    if (!this.connections[peerId]) {
      this.connectToPeer(peerId);
    }

    const conn = this.connections[peerId];
    if (!conn || conn.open === false) return;

    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result;
      if (arrayBuffer instanceof ArrayBuffer) {
        void conn.send({
          type: "file",
          name: file.name,
          fileId: `${peerId}-${Date.now()}`,
          content: arrayBuffer,
        });
        console.log(`[PeerService] Envoyé ${file.name} à ${peerId}`);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  destroy(): void {
    Object.values(this.connections).forEach((conn) => conn.close());
    this.connections = {};
    this.peer.destroy();
  }

  getConnectedPeers(): string[] {
    return Object.keys(this.connections);
  }
}
