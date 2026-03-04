export interface File {
  fileName: string;
  fileSize: number;
  fileUrl?: string;
}

export interface Message {
  id: string;
  received: boolean;
  content: string;
  timestamp: Date;
  file?: File;
  system?: boolean;
}
