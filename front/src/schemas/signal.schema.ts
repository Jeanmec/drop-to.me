import { z } from "zod";

export const signalSchema = z.object({
  linkId: z.string(),
  publicKey: z.array(z.number()),
});

export type TSignal = z.infer<typeof signalSchema>;
