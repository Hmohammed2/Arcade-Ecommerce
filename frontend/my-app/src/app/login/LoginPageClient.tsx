"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { LogIn, Loader2 } from "lucide-react";
import { useAuth } from "@/store/useAuth"; // ✅ import your store
import { useGoogleLogin } from "@react-oauth/google";
import Turnstile from "react-turnstile";

export default function LoginPageClient() {
  const router = useRouter();
  const login = useAuth((s) => s.login);
  const [token, setToken] = useState<string | null>(null);

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData.username, formData.password, token ?? "");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const setAccessToken = useAuth((s) => s.setAccessToken);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsOAuthLoading("google");
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENT}/auth/google/`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ access_token: tokenResponse.access_token }),
          }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Google login failed");

        // store tokens in Zustand
        setAccessToken(data.access);
        localStorage.setItem("refreshToken", data.refresh);
        toast.success("Logged in with Google 🎉");

        await useAuth.getState().fetchUser();
        router.push("/dashboard");
      } catch (err: any) {
        toast.error(err.message || "Google login failed");
      } finally {
        setIsOAuthLoading(null);
      }
    },
    onError: () => toast.error("Google login cancelled"),
  });

  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-900 shadow-md dark:shadow-lg rounded-lg p-8 transition-colors duration-300 text-gray-800 dark:text-gray-100">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
        Sign In
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Username */}
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Username
          </label>
          <input
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm py-2 px-3 transition-colors"
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm py-2 px-3 transition-colors"
          />
        </div>

        <Turnstile
          sitekey={process.env.NEXT_PUBLIC_API_SITE_KEY!}
          onVerify={(token) => setToken(token)}
        />

        {/* Login button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-pink-600 hover:bg-pink-700 dark:hover:bg-pink-500 text-white rounded-md font-semibold shadow-sm transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin w-5 h-5" /> Signing in...
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5" /> Login
            </>
          )}
        </button>
      </form>

      {/* OAuth Buttons */}
      <div className="flex flex-col space-y-3 mt-6">
        <button
          onClick={() => googleLogin()}
          disabled={!!isOAuthLoading}
          className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md font-medium flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 bg-white dark:bg-gray-900"
        >
          {isOAuthLoading === "google" ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : (
            <img src="/google-icon.png" alt="Google" className="w-5 h-5" />
          )}
          Continue with Google
        </button>
      </div>

      <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>
          Don’t have an account?{" "}
          <Link
            href="/register"
            className="text-pink-600 dark:text-pink-400 hover:text-pink-800 dark:hover:text-pink-300 font-medium"
          >
            Register
          </Link>
        </p>
        <p className="mt-3">
          <Link
            href="/forgot-password"
            className="text-gray-500 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400"
          >
            Forgot your password?
          </Link>
        </p>
      </div>
    </div>
  );
}
