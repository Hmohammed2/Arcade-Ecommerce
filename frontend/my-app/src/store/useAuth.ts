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
  is_staff?: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  authReady?: boolean;

  login: (
    identifier: string,
    password: string,
    turnstileToken: string,
  ) => Promise<void>;

  logout: () => void;

  fetchUser: () => Promise<void>;

  refreshAccessToken: () => Promise<string | null>;

  setAccessToken: (token: string) => void;

  setAuthReady: (v: boolean) => void;
}

/*
Prevent multiple refresh calls racing
*/
let refreshPromise: Promise<string | null> | null = null;

export const useAuth = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        authReady: false,

        setAuthReady: (v) => set({ authReady: v }),

        /*
        LOGIN
        */
        login: async (identifier, password, turnstileToken) => {
          try {
            if (!turnstileToken) throw new Error("Please complete the CAPTCHA");

            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL_CLIENT}/users/login/`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  identifier,
                  password,
                  token: turnstileToken,
                }),
              },
            );

            const data = await res.json();

            if (!res.ok) throw new Error(data.detail || "Login failed");

            set({
              accessToken: data.access,
              refreshToken: data.refresh,
              user: data.user,
              isAuthenticated: true,
            });

            toast.success("Logged in successfully 🎉");

            await get().fetchUser();
          } catch (err: unknown) {
            console.error("Login error:", err);

            const message =
              err instanceof Error
                ? err.message
                : typeof err === "string"
                  ? err
                  : "Invalid credentials";

            toast.error(message);

            set({ isAuthenticated: false });

            throw err;
          }
        },

        /*
        LOGOUT
        */
        logout: () => {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });

          toast.success("Logged out 👋");
        },

        /*
        FETCH AUTHENTICATED USER
        */
        fetchUser: async () => {
          const { accessToken } = get();

          if (!accessToken) return;

          try {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL_CLIENT}/users/user/`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              },
            );

            /*
            Access token expired
            */
            if (res.status === 401) {
              const newToken = await get().refreshAccessToken();

              if (!newToken) return;

              return get().fetchUser();
            }

            if (!res.ok) throw new Error("Failed to fetch user");

            const user = await res.json();

            set({
              user,
              isAuthenticated: true,
            });
          } catch (err) {
            console.error("fetchUser error:", err);

            set({
              user: null,
              isAuthenticated: false,
            });
          }
        },

        setAccessToken: (token: string) => {
          set({
            accessToken: token,
            isAuthenticated: true,
          });
        },

        /*
        REFRESH ACCESS TOKEN
        */
        refreshAccessToken: async () => {
          const { refreshToken } = get();

          if (!refreshToken) return null;

          /*
          Lock refresh so multiple requests don't trigger multiple refresh calls
          */
          if (!refreshPromise) {
            refreshPromise = (async () => {
              try {
                const newAccessToken = await refreshTokenAPI(refreshToken);

                set({
                  accessToken: newAccessToken,
                  isAuthenticated: true,
                });

                return newAccessToken;
              } catch (err) {
                console.error("Token refresh failed:", err);

                get().logout();

                return null;
              } finally {
                refreshPromise = null;
              }
            })();
          }

          return refreshPromise;
        },
      }),

      /*
      Persist settings
      */
      {
        name: "auth-storage",

        partialize: (state) => ({
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),

        /*
        Ensure hydration finishes before auth logic runs
        */
        onRehydrateStorage: () => (state) => {
          state?.setAuthReady(true);
        },
      },
    ),

    { name: "AuthStore" },
  ),
);
