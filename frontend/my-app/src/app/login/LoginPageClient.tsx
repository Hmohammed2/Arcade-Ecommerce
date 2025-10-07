"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { LogIn, Loader2 } from "lucide-react";
import { useAuth } from "@/store/useAuth"; // ✅ import your store

export default function LoginPageClient() {
  const router = useRouter();
  const login = useAuth((s) => s.login); // ✅ get login from Zustand

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
      await login(formData.username, formData.password); // ✅ use Zustand
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider: "google" | "github") => {
    setIsOAuthLoading(provider);
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL_CLIENT}/auth/${provider}/login/`;
  };

  return (
    <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Sign In
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Username */}
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700"
          >
            Username
          </label>
          <input
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm py-2 px-3"
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm py-2 px-3"
          />
        </div>

        {/* Login button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-pink-600 hover:bg-pink-700 text-white rounded-md font-semibold shadow-sm transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
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
          onClick={() => handleOAuthLogin("google")}
          disabled={!!isOAuthLoading}
          className="w-full py-2 px-4 border border-gray-300 rounded-md font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {isOAuthLoading === "google" ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : (
            <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
          )}
          Continue with Google
        </button>

        <button
          onClick={() => handleOAuthLogin("github")}
          disabled={!!isOAuthLoading}
          className="w-full py-2 px-4 border border-gray-300 rounded-md font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {isOAuthLoading === "github" ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : (
            <img src="/github-icon.svg" alt="GitHub" className="w-5 h-5" />
          )}
          Continue with GitHub
        </button>
      </div>

      <div className="mt-6 text-center text-sm text-gray-600">
        <p>
          Don’t have an account?{" "}
          <Link
            href="/register"
            className="text-pink-600 hover:text-pink-800 font-medium"
          >
            Register
          </Link>
        </p>
        <p className="mt-3">
          <Link
            href="/forgot-password"
            className="text-gray-500 hover:text-pink-600"
          >
            Forgot your password?
          </Link>
        </p>
      </div>
    </div>
  );
}
