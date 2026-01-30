"use client";

import { useState } from "react";
import Turnstile from "react-turnstile";
import { useTheme } from "next-themes";

const API_BASE = process.env.NEXT_PUBLIC_API_URL_CLIENT;

export default function ContactClient() {
  const { theme } = useTheme();

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [token, setToken] = useState<string | null>(null);

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setStatus("loading");

    try {
      const res = await fetch(`${API_BASE}/users/contact/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          turnstile_token: token,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      setStatus("success");
      setForm({ name: "", email: "", message: "" });
      setToken(null);
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="max-w-7xl">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        <input
          name="name"
          required
          placeholder="Your name"
          value={form.name}
          onChange={handleChange}
          className="
            rounded-md border px-4 py-3
            bg-white text-gray-900 border-gray-300
            focus:border-pink-500 focus:ring-pink-500
            dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600
          "
        />

        <input
          name="email"
          type="email"
          required
          placeholder="Your email"
          value={form.email}
          onChange={handleChange}
          className="
            rounded-md border px-4 py-3
            bg-white text-gray-900 border-gray-300
            focus:border-pink-500 focus:ring-pink-500
            dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600
          "
        />

        <textarea
          name="message"
          required
          rows={6}
          placeholder="Your message"
          value={form.message}
          onChange={handleChange}
          className="
            col-span-full rounded-md border px-4 py-3
            bg-white text-gray-900 border-gray-300
            focus:border-pink-500 focus:ring-pink-500
            dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600
          "
        />

        {/* Turnstile */}
        <div className="col-span-full">
          <Turnstile
            sitekey={process.env.NEXT_PUBLIC_API_SITE_KEY!}
            theme={theme === "dark" ? "dark" : "light"}
            onVerify={(t) => setToken(t)}
            onExpire={() => setToken(null)}
            onError={() => setToken(null)}
          />
        </div>

        <div className="col-span-full">
          <button
            type="submit"
            disabled={status === "loading" || !token}
            className="
              inline-flex items-center justify-center rounded-full
              bg-pink-600 px-8 py-3 font-semibold text-white
              transition
              hover:bg-pink-700
              dark:hover:bg-pink-500
              disabled:opacity-50
            "
          >
            {status === "loading" ? "Sending…" : "Send message"}
          </button>
        </div>

        {status === "success" && (
          <p className="col-span-full text-green-600 dark:text-green-400">
            Thanks! Your message has been sent.
          </p>
        )}

        {status === "error" && (
          <p className="col-span-full text-red-600 dark:text-red-400">
            Something went wrong. Please try again later.
          </p>
        )}
      </form>
    </div>
  );
}
