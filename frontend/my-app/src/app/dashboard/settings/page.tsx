import type { Metadata } from "next";
import AccountPageClient from "./AccountPageClient";

const baseUrl =
  process.env.NEXT_PUBLIC_API_URL_CLIENT || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Account Settings | ArcadeStickLabs",
  description:
    "Manage your account information, update your profile, and change your password.",
  openGraph: {
    title: "Account Settings | ArcadeStickLabs",
    description:
      "Edit your name, email, and password securely in your ArcadeStickLabs account.",
    url: `${baseUrl}/dashboard/settings`,
    siteName: "ArcadeStickLabs",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Account Settings - ArcadeStickLabs",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  alternates: {
    canonical: `${baseUrl}/dashboard/settings`,
  },
};

export default async function AccountSettingsPage() {
  return (
    <div className="mx-auto px-6 py-12 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-10 text-center">
        Account Settings
      </h1>
      <div className="flex justify-center">
        <AccountPageClient />
      </div>
    </div>
  );
}
