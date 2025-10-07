"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Instagram } from "lucide-react";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    // Simulate async request (replace with actual API call)
    setTimeout(() => {
      if (email.includes("@")) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    }, 1000);
  };

  return (
    <footer className="border-t shadow-md mx-auto px-6 py-10 bg-white text-gray-800">
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
            <p className="text-gray-600 text-sm leading-relaxed">
              Custom arcade sticks built with passion and precision. Designed to
              enhance your gameplay.
            </p>
          </div>

          {/* 🧭 Explore Links */}
          <div>
            <h4 className="text-xl font-semibold mb-4">Explore</h4>
            <ul className="space-y-2 text-gray-700">
              <li>
                <Link
                  href="/shop"
                  className="hover:text-pink-600 transition-colors duration-200"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-pink-600 transition-colors duration-200"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="hover:text-pink-600 transition-colors duration-200"
                >
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* ✉️ Newsletter & Social */}
          <div>
            <h4 className="text-xl font-semibold mb-4">Stay Connected</h4>
            <p className="text-gray-600 mb-4">
              Subscribe to our newsletter for updates and product launches.
            </p>

            <form onSubmit={handleSubscribe} className="flex">
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-l-full text-gray-800 focus:outline-pink-600 border border-gray-300"
                required
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="bg-pink-600 text-white px-6 rounded-r-full font-semibold hover:bg-pink-700 transition-colors duration-200 disabled:opacity-50"
              >
                {status === "loading" ? "…" : "Subscribe"}
              </button>
            </form>

            {status === "success" && (
              <p className="text-green-600 mt-2">Thanks for subscribing! 🎉</p>
            )}
            {status === "error" && (
              <p className="text-red-600 mt-2">
                Please enter a valid email address.
              </p>
            )}

            {/* 🌐 Social Icons */}
            <div className="flex space-x-4 mt-6">
              <a
                href="https://www.instagram.com/arcadesticklabs/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-600 transition-colors duration-200"
              >
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        {/* 📜 Legal Links */}
        <div className="container mx-auto px-4 mt-10 text-center space-x-6 text-sm">
          <Link
            href="/terms"
            className="text-gray-500 hover:text-pink-600 transition-colors duration-200"
          >
            Terms &amp; Conditions
          </Link>
          <Link
            href="/privacy"
            className="text-gray-500 hover:text-pink-600 transition-colors duration-200"
          >
            Privacy Policy
          </Link>
          <Link
            href="/cookies"
            className="text-gray-500 hover:text-pink-600 transition-colors duration-200"
          >
            Cookies Policy
          </Link>
        </div>

        {/* © Copyright */}
        <div className="border-t border-gray-200 mt-6 pt-6">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} ArcadeStickLabs. All rights
            reserved.
          </p>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;
