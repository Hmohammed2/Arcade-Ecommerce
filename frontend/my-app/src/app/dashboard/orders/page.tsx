import type { Metadata } from "next";
import OrderHistoryPageClient from "./OrdersHistoryPageClient";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// ✅ SEO Metadata
export const metadata: Metadata = {
  title: "Your Order History | ArcadeStickLabs",
  description:
    "View your past purchases, order details, and payment history on your ArcadeStickLabs dashboard.",
  openGraph: {
    title: "Order History | ArcadeStickLabs",
    description:
      "Track your previous orders, view payment details, and download receipts.",
    url: `${baseUrl}/dashboard/orders`,
    siteName: "ArcadeStickLabs",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ArcadeStickLabs Order History",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Your Order History | ArcadeStickLabs",
    description:
      "Easily view your past orders and download receipts on your ArcadeStickLabs account.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: `${baseUrl}/dashboard/orders`,
  },
};

export default async function OrdersPage() {
  return (
    <div className="min-h-screen max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Order History</h1>
      <OrderHistoryPageClient />
    </div>
  );
}
