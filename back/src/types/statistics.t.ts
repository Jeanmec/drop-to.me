export type TStatistics = {
  totalTransfers: number;
  sizeTransferred: number;
  users: number;
  messagesSent: number;
};

export type TStatType = 'message' | 'file' | 'user';

export type TAddStatPayload = {
  type: TStatType;
  fileSize?: number;
};

export type TUpdateStatPayload = {
  type: 'messages' | 'files' | 'users';
  count: number;
  size?: number;
};
