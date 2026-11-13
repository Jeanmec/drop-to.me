export interface File {
  fileName: string;
  fileSize: number;
  fileUrl?: string;
}

export type MessageDelivery = "pending" | "delivered" | "failed";

export interface Message {
  id: string;
  received: boolean;
  content: string;
  timestamp: Date;
  file?: File;
  system?: boolean;
  delivery?: MessageDelivery;
}
