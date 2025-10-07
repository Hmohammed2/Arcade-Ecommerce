"use client";

import { useAuth } from "@/store/useAuth";
import { refreshAccessToken } from "@/library/refreshAccessToken";

export function useAuthorizedFetch() {
  const { accessToken, refreshToken, logout, setAccessToken } = useAuth();

  const authorizedFetch = async (url: string, options: RequestInit = {}) => {
    let token = accessToken;

    const makeRequest = async (token: string | null) => {
      const headers = {
        ...options.headers,
        Authorization: token ? `Bearer ${token}` : "",
      };
      return fetch(url, { ...options, headers });
    };

    let res = await makeRequest(token);

    // If token expired, try to refresh
    if (res.status === 401 && refreshToken) {
      try {
        const newAccessToken = await refreshAccessToken(refreshToken);
        setAccessToken(newAccessToken);
        res = await makeRequest(newAccessToken); // retry once
      } catch (err) {
        console.error("Refresh token failed:", err);
        logout();
      }
    }

    return res;
  };

  return authorizedFetch;
}
