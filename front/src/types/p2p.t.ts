// Types pour les données envoyées via P2P

export interface P2PFileData {
  type: "file";
  fileId: string;
  fileName: string;
  fileSize: number;
  fileType: string; // MIME type
  content: number[]; // Array de bytes pour compatibilité avec Blob
}

export interface P2PMessageData {
  type: "message";
  messageId: string;
  content: string;
  timestamp: Date;
}

export interface P2PAck {
  type: "ack";
  ackId: string;
}

export type P2PData = P2PFileData | P2PMessageData | P2PAck;

// Types pour les fichiers reçus
export interface ReceivedFile {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string; // MIME type
  fileUrl: string;
  blob: Blob;
}
