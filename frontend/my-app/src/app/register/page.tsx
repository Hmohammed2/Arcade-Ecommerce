import type { Metadata } from "next";
import RegisterPageClient from "./RegisterPageClient";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Create Account | ArcadeStickLabs",
  description:
    "Register for an ArcadeStickLabs account to manage your orders, checkout faster, and receive updates on custom arcade products.",
  openGraph: {
    title: "Create Account | ArcadeStickLabs",
    description:
      "Join ArcadeStickLabs to access exclusive custom arcade builds, updates, and order tracking.",
    url: `${baseUrl}/register`,
    siteName: "ArcadeStickLabs",
    images: [
      {
        url: "/og-image-register.jpg",
        width: 1200,
        height: 630,
        alt: "ArcadeStickLabs Registration",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  alternates: {
    canonical: `${baseUrl}/register`,
  },
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 dark:bg-gray-900 ">
      <RegisterPageClient />
    </main>
  );
}
