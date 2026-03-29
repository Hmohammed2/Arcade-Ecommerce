"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

const COOLDOWN_DAYS = 3;

export default function NewsletterPopup() {
  const pathname = usePathname();

  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  // =========================
  // 🎯 ROUTE TARGETING
  // =========================
  const isHighIntentPage =
    pathname?.includes("/product") ||
    pathname?.includes("/resources") ||
    pathname?.includes("/resources/articles");

  const isBlockedPage =
    pathname?.includes("/checkout") || pathname?.includes("/cart");

  // =========================
  // 🎯 TRIGGER LOGIC
  // =========================
  useEffect(() => {
    if (!isHighIntentPage || isBlockedPage) return;

    const lastSeen = localStorage.getItem("newsletter_popup_seen");

    if (lastSeen) {
      const diff = Date.now() - Number(lastSeen);
      const cooldown = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

      if (diff < cooldown) return;
    }

    let shown = false;

    const showPopup = () => {
      if (shown) return;
      shown = true;

      setShow(true);
      localStorage.setItem("newsletter_popup_seen", Date.now().toString());
    };

    // ⏱ Time trigger (7s)
    const timer = setTimeout(showPopup, 7000);

    // 📜 Scroll trigger (35%)
    const handleScroll = () => {
      const scrollPercent =
        window.scrollY / (document.body.scrollHeight - window.innerHeight);

      if (scrollPercent > 0.35) {
        showPopup();
      }
    };

    // 🖱 Exit intent (desktop)
    const handleExit = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        showPopup();
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mouseout", handleExit);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mouseout", handleExit);
    };
  }, [pathname, isHighIntentPage, isBlockedPage]);

  // =========================
  // ✉️ SUBMIT LOGIC
  // =========================
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENT}/api/newsletter/subscribe/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            source: "popup",
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Subscription failed");
      }

      setStatus("success");
      setEmail("");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  // =========================
  // 🧠 DYNAMIC COPY
  // =========================
  let headline = "Upgrade Your Setup 🎮";
  let subtext = "Get 10% off your first order + beginner build guides.";

  if (pathname?.includes("/guides") || pathname?.includes("/blog")) {
    headline = "Want the exact parts from this guide?";
    subtext = "Join the list and get 10% off + curated parts recommendations.";
  }

  if (pathname?.includes("/product")) {
    headline = "Get 10% off this setup";
    subtext = "Unlock your discount and upgrade your build today.";
  }

  // =========================
  // UI
  // =========================
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="
              relative
              w-full max-w-md
              bg-white dark:bg-gray-900
              rounded-2xl p-6
              shadow-xl
              border border-gray-200 dark:border-gray-700
              text-center
            "
          >
            {/* CLOSE */}
            <button
              onClick={() => setShow(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>

            {/* HEADLINE */}
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              {headline}
            </h2>

            {/* SUBTEXT */}
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {subtext}
            </p>

            {/* FORM */}
            <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="
                  w-full px-4 py-2 rounded-full
                  text-black dark:text-gray-100
                  bg-gray-100 dark:bg-gray-800
                  border border-gray-300 dark:border-gray-600
                  focus:outline-none focus:ring-2 focus:ring-pink-600
                "
                required
              />

              <button
                type="submit"
                disabled={status === "loading"}
                className="
                  bg-pink-600 text-white
                  py-3 rounded-full font-semibold
                  hover:bg-pink-700 transition
                  disabled:opacity-50
                "
              >
                {status === "loading" ? "…" : "Unlock 10%"}
              </button>
            </form>

            {/* FEEDBACK */}
            {status === "success" && (
              <p className="text-green-600 dark:text-green-400 mt-3 text-sm">
                🎉 Check your inbox for your discount code.
              </p>
            )}

            {status === "error" && (
              <p className="text-red-600 dark:text-red-400 mt-3 text-sm">
                Please enter a valid email.
              </p>
            )}

            {/* TRUST */}
            <p className="text-xs text-gray-400 mt-4">
              No spam. Just restocks, builds & upgrades.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
