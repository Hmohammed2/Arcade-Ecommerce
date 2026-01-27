"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Instagram } from "lucide-react";
import { useAuth } from "@/store/useAuth";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const { isAuthenticated, user, logout } = useAuth();

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
            source: "footer",
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

  return (
    <footer className="border-t shadow-md mx-auto px-6 py-10 bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 🕹️ Logo */}
          <div className="flex flex-col items-start">
            <Image
              src="/Logo.webp"
              alt="ArcadeStickLabs Logo"
              width={128}
              height={128}
              className="w-32 mb-4 rounded-lg"
            />
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Custom arcade sticks built with passion and precision. Designed to
              enhance your gameplay.
            </p>
          </div>

          {/* 🧭 Explore Links */}
          <div>
            <h4 className="text-xl font-semibold mb-4">Explore</h4>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>
                <Link
                  href="/shop"
                  className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors duration-200"
                >
                  Shop
                </Link>
              </li>

              {!isAuthenticated ? (
                <>
                  <li>
                    <Link
                      href="/login"
                      className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors duration-200"
                    >
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/register"
                      className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors duration-200"
                    >
                      Register
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      href="dashboard/orders"
                      className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors duration-200"
                    >
                      My Orders
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard"
                      className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors duration-200"
                    >
                      Account ({user?.first_name || user?.email})
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={logout}
                      className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors duration-200"
                    >
                      Logout
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* ✉️ Newsletter & Social */}
          <div>
            <h4 className="text-xl font-semibold mb-4">Stay Connected</h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Subscribe to our newsletter for updates and product launches.
            </p>

            <form onSubmit={handleSubscribe} className="flex">
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-l-full text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-pink-600 border border-gray-300 dark:border-gray-600"
                required
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="bg-pink-600 text-white px-6 rounded-r-full font-semibold hover:bg-pink-700 dark:hover:bg-pink-500 transition-colors duration-200 disabled:opacity-50"
              >
                {status === "loading" ? "…" : "Subscribe"}
              </button>
            </form>

            {status === "success" && (
              <p className="text-green-600 dark:text-green-400 mt-2">
                Thanks for subscribing! 🎉
              </p>
            )}
            {status === "error" && (
              <p className="text-red-600 dark:text-red-400 mt-2">
                Please enter a valid email address.
              </p>
            )}

            <div className="flex space-x-4 mt-6">
              <a
                href="https://www.instagram.com/arcadesticklabs/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors duration-200"
              >
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        {/* 💳 Payment Methods */}
        <div className="container mx-auto px-4 mt-10">
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Secure payments accepted
            </p>

            <div className="flex items-center gap-4 opacity-80">
              <Image
                src="/icons/paypal.svg"
                alt="paypal"
                width={44}
                height={28}
              />
              <Image
                src="/icons/apple_pay.png"
                alt="Apple Pay"
                width={44}
                height={28}
              />
              <Image
                src="/icons/google_pay.png"
                alt="google_pay"
                width={44}
                height={28}
              />
              <Image
                src="/icons/klarna.jpeg"
                alt="Klarna"
                width={44}
                height={28}
              />
              <Image
                src="/icons/revolut_pay.svg"
                alt="Revolut Pay"
                width={44}
                height={28}
              />
              <Image src="/icons/jcb.png" alt="jcb" width={44} height={28} />
              <Image
                src="/icons/mastercard.png"
                alt="Mastercard"
                width={44}
                height={28}
              />
              <Image src="/icons/visa.png" alt="Visa" width={44} height={28} />
              <Image
                src="/icons/maestro.png"
                alt="Maestro"
                width={44}
                height={28}
              />
            </div>
          </div>
        </div>

        {/* 📜 Legal Links */}
        <div className="container mx-auto px-4 mt-10 text-center space-x-6 text-sm">
          <Link
            href="/terms"
            className="text-gray-500 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors duration-200"
          >
            Terms &amp; Conditions
          </Link>
          <Link
            href="/privacy"
            className="text-gray-500 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors duration-200"
          >
            Privacy Policy
          </Link>
          <Link
            href="/refund"
            className="text-gray-500 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors duration-200"
          >
            Refund & Returns Policy
          </Link>
        </div>

        {/* © Copyright + Support */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} ArcadeStickLabs. All rights
            reserved.
          </p>
          <p className="mt-2">
            For support contact{" "}
            <a
              href="mailto:support@arcadesticklabs.co.uk"
              className="text-pink-600 dark:text-pink-400 hover:underline"
            >
              support@arcadesticklabs.co.uk
            </a>
          </p>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;
