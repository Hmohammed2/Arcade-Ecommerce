import { clientEnv } from "@/env-zod-schema/client";

// lib/fetchUserAddresses.ts
export async function fetchUserAddresses(accessToken: string) {
  const res = await fetch(
    `${clientEnv.NEXT_PUBLIC_API_URL_CLIENT}/users/addresses/`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to load addresses");
  }

  return res.json();
}
