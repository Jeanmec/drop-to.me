import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const LIST_SEPARATOR = ",";

export const env = createEnv({
  client: {
    NEXT_PUBLIC_BACKEND_URL: z.string().url(),
    NEXT_PUBLIC_STUN_URLS: z
      .string()
      .transform((value) =>
        value.split(LIST_SEPARATOR).map((url) => url.trim()),
      )
      .pipe(z.array(z.string().url()).min(1)),
    NEXT_PUBLIC_WEBSITE_NAME: z.string(),
    NEXT_PUBLIC_TURN_URL: z.string().optional(),
    NEXT_PUBLIC_TURN_USERNAME: z.string().optional(),
    NEXT_PUBLIC_TURN_CREDENTIAL: z.string().optional(),
    NEXT_PUBLIC_GITHUB_URL: z.string().url().optional(),
    NEXT_PUBLIC_AUTHOR_GITHUB_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_STUN_URLS: process.env.NEXT_PUBLIC_STUN_URLS,
    NEXT_PUBLIC_WEBSITE_NAME: process.env.NEXT_PUBLIC_WEBSITE_NAME,
    NEXT_PUBLIC_TURN_URL: process.env.NEXT_PUBLIC_TURN_URL,
    NEXT_PUBLIC_TURN_USERNAME: process.env.NEXT_PUBLIC_TURN_USERNAME,
    NEXT_PUBLIC_TURN_CREDENTIAL: process.env.NEXT_PUBLIC_TURN_CREDENTIAL,
    NEXT_PUBLIC_GITHUB_URL: process.env.NEXT_PUBLIC_GITHUB_URL,
    NEXT_PUBLIC_AUTHOR_GITHUB_URL: process.env.NEXT_PUBLIC_AUTHOR_GITHUB_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
