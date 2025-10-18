export interface MessageFile {
  fileName: string;
  fileSize: number;
  fileUrl?: string;
}

export interface Message {
  received: boolean;
  content: string;
  timestamp: Date;
  file?: MessageFile;
}
