import { z } from "zod";
import { MessageDelivery } from "@/types/message.t";

export const storedMessageSchema = z.object({
  id: z.string(),
  received: z.boolean(),
  content: z.string(),
  timestamp: z.coerce.date(),
  system: z.boolean().optional(),
  delivery: z.nativeEnum(MessageDelivery).optional(),
});

export const storedHistorySchema = z.array(z.unknown());
