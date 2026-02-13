import { clientEnv } from "@/env/client";

export async function refreshAccessToken(refreshToken: string) {
  const res = await fetch(
    `${clientEnv.NEXT_PUBLIC_API_URL_CLIENT}/users/token/refresh/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    },
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Failed to refresh token");
  }

  return data.access; // return the new access token
}
