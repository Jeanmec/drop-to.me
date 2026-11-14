// the enum values travel between the front and the back
export enum StatType {
  MESSAGE = 'message',
  FILE = 'file',
  USER = 'user',
}

export enum StatUpdateType {
  MESSAGES = 'messages',
  FILES = 'files',
  USERS = 'users',
}

export type TStatistics = {
  totalTransfers: number;
  sizeTransferred: number;
  users: number;
  messagesSent: number;
};

export type TAddStat = {
  type: StatType;
  fileSize?: number;
};

export type TStatUpdate = {
  type: StatUpdateType;
  count: number;
  size?: number;
};
