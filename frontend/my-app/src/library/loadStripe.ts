// lib/stripe.ts
import { clientEnv } from "@/env-zod-schema/client";
import { loadStripe } from "@stripe/stripe-js";

export const stripePromise = loadStripe(
  clientEnv.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);
