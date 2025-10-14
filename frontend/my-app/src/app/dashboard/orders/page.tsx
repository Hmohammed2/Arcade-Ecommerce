import type { Metadata } from "next";
import OrderHistoryPageClient from "./OrdersHistoryPageClient";

const baseUrl =
  process.env.NEXT_PUBLIC_API_URL_CLIENT || "http://localhost:3000";

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
    <div className="min-h-screen mx-auto px-6 py-12 bg-white dark:bg-gray-900 transition-colors duration-300">
      <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-10">
        Order History
      </h1>
      <OrderHistoryPageClient />
    </div>
  );
}
