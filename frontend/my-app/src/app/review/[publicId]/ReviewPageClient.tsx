"use client";

import { useMemo, useState } from "react";

type SubmitState = "idle" | "submitting" | "success" | "error";

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`text-2xl transition ${
            n <= value ? "opacity-100" : "opacity-30"
          }`}
          aria-label={`${n} star`}
        >
          ★
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
        {value}/5
      </span>
    </div>
  );
}

export default function ReviewPageClient({
  publicId,
  token,
}: {
  publicId: string;
  token?: string;
}) {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL_CLIENT; // e.g. https://api.arcadesticklabs.co.uk
  const submitUrl = useMemo(() => {
    if (!API_BASE) return "";
    return `${API_BASE}/reviews/submit/`;
  }, [API_BASE]);

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(true);

  const [state, setState] = useState<SubmitState>("idle");
  const [error, setError] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!submitUrl) {
      setState("error");
      setError("Missing NEXT_PUBLIC_API_BASE.");
      return;
    }
    if (!body.trim()) {
      setState("error");
      setError("Please write a short review.");
      return;
    }
    if (rating < 1 || rating > 5) {
      setState("error");
      setError("Rating must be between 1 and 5.");
      return;
    }

    setState("submitting");

    try {
      const res = await fetch(submitUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // token is optional; if you add signing later, pass it through here
        body: JSON.stringify({
          order_public_id: publicId,
          token: token || "",
          rating,
          title: title.trim(),
          body: body.trim(),
          display_name: displayName.trim(),
          email: email.trim(),
          consent_to_publish_name: consent,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg =
          data?.detail ||
          data?.non_field_errors?.[0] ||
          "Failed to submit review.";
        throw new Error(msg);
      }

      setState("success");
    } catch (err: any) {
      setState("error");
      setError(err?.message || "Something went wrong.");
    }
  }

  if (state === "success") {
    return (
      <div>
        <h2 className="text-xl font-semibold">Thank you! ✅</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Your review has been submitted.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium">Rating</label>
        <div className="mt-2">
          <StarRating value={rating} onChange={setRating} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Title (optional)</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring dark:border-gray-800 dark:bg-gray-950"
          placeholder="e.g. Crown lever feels amazing"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Your review</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          maxLength={2000}
          className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring dark:border-gray-800 dark:bg-gray-950"
          placeholder="What did you order, how was shipping, how does it feel, etc?"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {body.length}/2000
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Name (optional)</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={80}
            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring dark:border-gray-800 dark:bg-gray-950"
            placeholder="John Doe / A Tekken player / etc"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email (optional)</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={254}
            type="email"
            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring dark:border-gray-800 dark:bg-gray-950"
            placeholder="Only used for verification/support"
          />
        </div>
      </div>

      <label className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-200">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1"
        />
        <span>It’s okay to display my name alongside my review.</span>
      </label>

      {state === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}

      <button
        disabled={state === "submitting"}
        className="w-full rounded-2xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-gray-900"
      >
        {state === "submitting" ? "Submitting..." : "Submit review"}
      </button>
    </form>
  );
}
