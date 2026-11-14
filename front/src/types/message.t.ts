// the values are stored in the chat history
export enum MessageDelivery {
  PENDING = "pending",
  DELIVERED = "delivered",
  FAILED = "failed",
}

export type TMessageFile = {
  fileName: string;
  fileSize: number;
  fileUrl?: string;
};

export type TNewMessage = {
  received: boolean;
  content: string;
  file?: TMessageFile;
  system?: boolean;
  delivery?: MessageDelivery;
};

export type TMessage = {
  id: string;
  received: boolean;
  content: string;
  timestamp: Date;
  file?: TMessageFile;
  system?: boolean;
  delivery?: MessageDelivery;
};
