import { clientEnv } from "@/env-zod-schema/client";

// lib/updateUserAddresses.ts
export interface UpdateAddressPayload {
  billing_first_name: string;
  billing_last_name: string;
  billing_email: string;
  billing_phone?: string;
  billing_address1: string;
  billing_address2?: string;
  billing_city: string;
  billing_postcode: string;
  same_as_billing: boolean;
  shipping_address1?: string;
  shipping_address2?: string;
  shipping_city?: string;
  shipping_postcode?: string;
}

export async function updateUserAddresses(
  accessToken: string,
  payload: UpdateAddressPayload,
) {
  const res = await fetch(
    `${clientEnv.NEXT_PUBLIC_API_URL_CLIENT}/users/addresses/`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to update addresses");
  }

  return res.json();
}
