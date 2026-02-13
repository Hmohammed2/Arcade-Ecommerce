import { z } from "zod";

const ServerEnvSchema = z.object({
  // Example for later:
  // DATABASE_URL: urlString,
  // STRIPE_SECRET_KEY: nonEmptyString,
});

export const serverEnv = ServerEnvSchema.parse({
  // DATABASE_URL: process.env.DATABASE_URL,
  // STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;
