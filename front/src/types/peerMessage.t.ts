// the values travel between browsers
export enum PeerMessageType {
  FILE_START = "file-start",
  FILE_START_ACK = "file-start-ack",
  FILE_PROGRESS = "file-progress",
  FILE_END = "file-end",
  CHAT = "message",
  ACK = "ack",
  HELLO = "hello",
}
