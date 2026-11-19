import type { TAddStat, TStatistics, TStatUpdate } from './statistics.t';

// the values are the event names on the wire
export enum SocketEvent {
  JOIN_ROOM = 'join-room',
  JOIN_SUCCESS = 'join-success',
  PEER_JOINED = 'peer-joined',
  PEER_LEFT = 'peer-left',
  SIGNAL = 'signal',
  GET_STAT = 'get-stat',
  ADD_STAT = 'add-stat',
  UPDATE_STAT = 'update-stat',
  GET_RELAY_TOKEN = 'get-relay-token',
  CHOOSE_FILE = 'choose-file',
  PEER_CHOOSING_FILE = 'peer-choosing-file',
}

export type TJoinRoom = {
  peerId: string;
  // proves on a rejoin that the peer id belongs to this browser
  token: string;
  roomCode?: string;
};

export type TJoinSuccess = {
  peers: string[];
  ip: string;
  roomCode: string | null;
};

export type TPeerChoosingFile = {
  peerId: string;
  isChoosing: boolean;
};

// the server relays the signal without reading it
export type TSignalToPeer = {
  to: string;
  signal: unknown;
};

type TSignalFromPeer = {
  from: string;
  signal: unknown;
};

export interface ServerToClientEvents {
  [SocketEvent.JOIN_SUCCESS]: (joinSuccess: TJoinSuccess) => void;
  [SocketEvent.PEER_JOINED]: (peerId: string) => void;
  [SocketEvent.PEER_LEFT]: (peerId: string) => void;
  [SocketEvent.SIGNAL]: (signal: TSignalFromPeer) => void;
  [SocketEvent.UPDATE_STAT]: (update: TStatUpdate) => void;
  [SocketEvent.PEER_CHOOSING_FILE]: (choice: TPeerChoosingFile) => void;
}

export interface ClientToServerEvents {
  [SocketEvent.JOIN_ROOM]: (joinRoom: TJoinRoom) => void;
  [SocketEvent.SIGNAL]: (signal: TSignalToPeer) => void;
  [SocketEvent.GET_STAT]: (
    payload: null,
    reply: (statistics: TStatistics | null) => void,
  ) => void;
  [SocketEvent.ADD_STAT]: (addStat: TAddStat) => void;
  [SocketEvent.GET_RELAY_TOKEN]: (
    payload: null,
    reply: (relayToken: string) => void,
  ) => void;
  [SocketEvent.CHOOSE_FILE]: (isChoosing: boolean) => void;
}
