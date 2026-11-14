import { z } from "zod";

const MAX_DEVICE_LABEL_LENGTH = 40;

const deviceLabelSchema = z.string().max(MAX_DEVICE_LABEL_LENGTH);

export const deviceSchema = z.object({
  name: deviceLabelSchema,
  browser: deviceLabelSchema,
  system: deviceLabelSchema,
});

export type TDevice = z.infer<typeof deviceSchema>;
