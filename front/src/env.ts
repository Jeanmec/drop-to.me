import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  client: {
    NEXT_PUBLIC_BACKEND_URL: z.string().url(),
    NEXT_PUBLIC_RELAY_URL: z
      .string()
      .url()
      .regex(/^wss?:\/\//),
    NEXT_PUBLIC_WEBSITE_NAME: z.string(),
    NEXT_PUBLIC_GITHUB_URL: z.string().url().optional(),
    NEXT_PUBLIC_AUTHOR_GITHUB_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_RELAY_URL: process.env.NEXT_PUBLIC_RELAY_URL,
    NEXT_PUBLIC_WEBSITE_NAME: process.env.NEXT_PUBLIC_WEBSITE_NAME,
    NEXT_PUBLIC_GITHUB_URL: process.env.NEXT_PUBLIC_GITHUB_URL,
    NEXT_PUBLIC_AUTHOR_GITHUB_URL: process.env.NEXT_PUBLIC_AUTHOR_GITHUB_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
