import { z } from "zod";
import { SignalKind } from "@/types/signal.t";

const descriptionSignalSchema = z.object({
  kind: z.literal(SignalKind.DESCRIPTION),
  linkId: z.string(),
  description: z.object({
    type: z.enum(["offer", "answer", "pranswer", "rollback"]),
    sdp: z.string().optional(),
  }),
});

const candidateSignalSchema = z.object({
  kind: z.literal(SignalKind.CANDIDATE),
  linkId: z.string(),
  candidate: z.object({
    candidate: z.string().optional(),
    sdpMid: z.string().nullable().optional(),
    sdpMLineIndex: z.number().nullable().optional(),
    usernameFragment: z.string().nullable().optional(),
  }),
});

const relaySignalSchema = z.object({
  kind: z.literal(SignalKind.RELAY),
  linkId: z.string(),
  publicKey: z.array(z.number()),
});

export const signalSchema = z.discriminatedUnion("kind", [
  descriptionSignalSchema,
  candidateSignalSchema,
  relaySignalSchema,
]);

export type TSignal = z.infer<typeof signalSchema>;
