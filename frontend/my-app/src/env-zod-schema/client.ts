import { z } from "zod";

const ClientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL_SERVER: z.string().url(),
  NEXT_PUBLIC_API_URL_CLIENT: z.string().url(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_API_SITE_KEY: z.string().min(1),
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().min(1),
  NEXT_PUBLIC_PAYPAL_CLIENT_ID: z.string().min(1),
  NEXT_PUBLIC_GA_ID: z.string().min(1),
  NODE_ENV: z.string().min(1),
});

export const clientEnv = ClientEnvSchema.parse({
  NEXT_PUBLIC_API_URL_SERVER: process.env.NEXT_PUBLIC_API_URL_SERVER,
  NEXT_PUBLIC_API_URL_CLIENT: process.env.NEXT_PUBLIC_API_URL_CLIENT,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_API_SITE_KEY: process.env.NEXT_PUBLIC_API_SITE_KEY,
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  NEXT_PUBLIC_PAYPAL_CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  NODE_ENV: process.env.NODE_ENV,
});

export type ClientEnv = z.infer<typeof ClientEnvSchema>;
