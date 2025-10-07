import type { Metadata } from "next";
import LoginPageClient from "./LoginPageClient";

const baseUrl =
  process.env.NEXT_PUBLIC_API_URL_CLIENT || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Login | ArcadeStickLabs",
  description:
    "Log in to your ArcadeStickLabs account to manage orders, track shipments, and access exclusive offers.",
  openGraph: {
    title: "Login | ArcadeStickLabs",
    description:
      "Access your ArcadeStickLabs account to manage your orders and profile.",
    url: `${baseUrl}/login`,
    siteName: "ArcadeStickLabs",
    images: [
      {
        url: "/og-image-login.jpg",
        width: 1200,
        height: 630,
        alt: "ArcadeStickLabs Login",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  alternates: {
    canonical: `${baseUrl}/login`,
  },
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <LoginPageClient />
    </main>
  );
}
