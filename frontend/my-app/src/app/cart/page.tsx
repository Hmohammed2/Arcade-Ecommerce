import type { Metadata } from "next";
import CartPageClient from "./CartPageClient"; // your current client file

export const metadata: Metadata = {
  title: "Your Shopping Cart | ArcadeStickLabs",
  description:
    "View and manage the items in your ArcadeStickLabs shopping cart. Review your selected arcade parts and proceed to checkout securely.",
  openGraph: {
    title: "Your Shopping Cart | ArcadeStickLabs",
    description:
      "Review your selected arcade components and checkout quickly with ArcadeStickLabs — the UK’s home for custom fightstick parts.",
    url: `${process.env.NEXT_PUBLIC_API_URL_CLIENT}/cart`,
    siteName: "ArcadeStickLabs",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_API_URL_CLIENT}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "ArcadeStickLabs Shopping Cart",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Your Shopping Cart | ArcadeStickLabs",
    description:
      "Manage your selected arcade parts and get ready to build the perfect fightstick.",
    images: [`${process.env.NEXT_PUBLIC_API_URL_CLIENT}/og-image.png`],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_API_URL_CLIENT}/cart`,
  },
};

export default function CartPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <CartPageClient />
      </div>
    </main>
  );
}
