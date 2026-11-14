import { z } from "zod";
import { deviceSchema } from "@/schemas/device.schema";
import { PeerMessageType } from "@/types/peerMessage.t";

const fileStartSchema = z.object({
  type: z.literal(PeerMessageType.FILE_START),
  fileId: z.string(),
  name: z.string(),
  size: z.number(),
});

const fileStartAckSchema = z.object({
  type: z.literal(PeerMessageType.FILE_START_ACK),
  fileId: z.string(),
});

const fileProgressSchema = z.object({
  type: z.literal(PeerMessageType.FILE_PROGRESS),
  fileId: z.string(),
  receivedBytes: z.number(),
});

const fileEndSchema = z.object({
  type: z.literal(PeerMessageType.FILE_END),
  fileId: z.string(),
});

const chatSchema = z.object({
  type: z.literal(PeerMessageType.CHAT),
  ackId: z.string(),
  content: z.string(),
});

const ackSchema = z.object({
  type: z.literal(PeerMessageType.ACK),
  ackId: z.string(),
});

const helloSchema = z.object({
  type: z.literal(PeerMessageType.HELLO),
  device: deviceSchema,
});

export const peerMessageSchema = z.discriminatedUnion("type", [
  fileStartSchema,
  fileStartAckSchema,
  fileProgressSchema,
  fileEndSchema,
  chatSchema,
  ackSchema,
  helloSchema,
]);

export type TPeerMessage = z.infer<typeof peerMessageSchema>;
export type TFileStartMessage = z.infer<typeof fileStartSchema>;
export type TFileStartAckMessage = z.infer<typeof fileStartAckSchema>;
export type TFileProgressMessage = z.infer<typeof fileProgressSchema>;
export type TFileEndMessage = z.infer<typeof fileEndSchema>;
export type TChatMessage = z.infer<typeof chatSchema>;
