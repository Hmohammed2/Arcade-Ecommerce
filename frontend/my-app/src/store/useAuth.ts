"use client";

import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { toast } from "react-hot-toast";
import { refreshAccessToken as refreshTokenAPI } from "@/library/refreshAccessToken";

interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  setAccessToken: (token: string) => void;
}

export const useAuth = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,

        // ✅ Login flow
        login: async (identifier, password) => {
          try {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL_CLIENT}/auth/login/`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // Django SimpleJWT expects "username"
                body: JSON.stringify({ username: identifier, password }),
              }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Login failed");

            // Save tokens
            set({
              accessToken: data.access,
              refreshToken: data.refresh,
            });

            toast.success("Logged in successfully 🎉");

            // Fetch user data next
            await get().fetchUser();
          } catch (err: any) {
            console.error("Login error:", err);
            toast.error(err.message || "Invalid credentials");
            set({ isAuthenticated: false });
            throw err;
          }
        },

        // ✅ Logout
        logout: () => {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });
          toast.success("Logged out 👋");
        },

        // ✅ Fetch authenticated user
        fetchUser: async () => {
          const { accessToken } = get();
          if (!accessToken) return;

          try {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL_CLIENT}/auth/user/`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );

            if (!res.ok) {
              if (res.status === 401) {
                // Token expired → try refresh
                await get().refreshAccessToken();
                return get().fetchUser();
              }
              throw new Error("Failed to fetch user");
            }

            const user = await res.json();
            set({ user, isAuthenticated: true });
          } catch (err) {
            console.error("fetchUser error:", err);
            set({ user: null, isAuthenticated: false });
          }
        },

        setAccessToken: (token: string) => {
          set({ accessToken: token, isAuthenticated: true });
        },

        // ✅ Refresh access token
        refreshAccessToken: async () => {
          const { refreshToken } = get();
          if (!refreshToken) return;

          try {
            const newAccessToken = await refreshTokenAPI(refreshToken);
            set({ accessToken: newAccessToken, isAuthenticated: true });
            return newAccessToken;
          } catch (err) {
            console.error("Token refresh failed:", err);
            get().logout();
            return null;
          }
        },
      }),
      {
        name: "auth-storage",
        // ✅ Keep only necessary fields
        partialize: (state) => ({
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: "AuthStore" }
  )
);
