import CheckoutPageClient from "./CheckoutPageClient";
import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Checkout | ArcadeStickLabs",
  description:
    "Complete your purchase at ArcadeStickLabs. Enter your billing details and confirm your order securely.",
  openGraph: {
    title: "Checkout | ArcadeStickLabs",
    description:
      "Complete your purchase at ArcadeStickLabs. Enter your billing details and confirm your order securely.",
    url: `${baseUrl}/checkout`,
    siteName: "ArcadeStickLabs",
    type: "website",
  },
};

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Checkout</h1>
        <CheckoutPageClient />
      </div>
    </main>
  );
}
