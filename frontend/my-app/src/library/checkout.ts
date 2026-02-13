import { clientEnv } from "@/env-zod-schema/client";

// lib/createPaymentIntent.ts or lib/checkout.ts
const baseUrl = clientEnv.NEXT_PUBLIC_API_URL_CLIENT;

/**
 * Checkout request to Django backend.
 * Supports both guest and authenticated users.
 */
export async function checkout(
  payload: {
    items: { product_id: number; quantity: number; colour: string }[];
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    billing_address?: string;
    shipping_address?: string;
    same_as_billing?: boolean;
    coupon_code?: string;
  },
  isAuthenticated: boolean,
  accessToken?: string | null,
) {
  const res = await fetch(`${baseUrl}/api/checkout/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(isAuthenticated && { Authorization: `Bearer ${accessToken}` }),
    },

    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Checkout failed: ${text}`);
  }

  return res.json();
  // returns { clientSecret, order_id, payment_id, amount, currency }
}
