import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import AuthHydration from "@/components/middleware/AuthHydration";
import QueryProvider from "./providers/providers";
import Script from "next/script";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import RouteTracker from "@/components/RouteTracker";
import "./globals.css";
import TopBanner from "@/components/TopBanner";

const baseUrl = "https://arcadesticklabs.co.uk"; // hard canonical

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: baseUrl,
  },
  title: "ArcadeStickLabs — Custom Arcade Parts & Fightstick Kits",
  description:
    "UK specialist store for premium arcade sticks, custom parts, Brook boards, Sanwa and Seimitsu components.",
  openGraph: {
    title: "ArcadeStickLabs — Custom Arcade Parts & Fightstick Kits",
    description:
      "Build your arcade stick with curated Sanwa, Seimitsu, Brook and Crown parts. Fast UK dispatch.",
    url: baseUrl,
    siteName: "ArcadeStickLabs",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "ArcadeStickLabs",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ArcadeStickLabs",
    description:
      "UK specialist arcade parts store for competitive fighting-game players.",
    images: [`${baseUrl}/og-image.png`],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Global Business / Merchant Schema */}
        <Script
          id="business-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Store",
              name: "ArcadeStickLabs",
              url: baseUrl,
              logo: `${baseUrl}/logo.png`,
              image: `${baseUrl}/og-image.png`,
              description:
                "UK specialist store for premium arcade sticks and fighting game accessories.",
              address: {
                "@type": "PostalAddress",
                addressCountry: "GB",
              },
              sameAs: [
                "https://www.yelp.co.uk/biz/arcadesticklabs",
                "https://instagram.com/arcadesticklabs",
              ],
            }),
          }}
        />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <GoogleAnalytics />
          <RouteTracker />
          <AuthHydration />
          <TopBanner />
          <Navbar />
          {children}
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
