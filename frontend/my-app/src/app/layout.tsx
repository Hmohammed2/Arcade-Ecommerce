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
import NewsletterPopup from "@/components/NewsLetterPopup";

const baseUrl = "https://arcadesticklabs.co.uk";

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
  icons: {
    icon: [{ url: "/favicon.ico" }],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  title: "Arcade Stick Parts UK | Fight Stick Parts & Guides | ArcadeStickLabs",
  description:
    "Shop arcade stick parts in the UK, including Sanwa, Seimitsu, Crown and Brook components for custom builds, upgrades, and fight stick mods.",
  openGraph: {
    title:
      "Arcade Stick Parts UK | Fight Stick Parts & Guides | ArcadeStickLabs",
    description:
      "Shop arcade stick parts in the UK, including Sanwa, Seimitsu, Brook and Crown components for custom builds and upgrades.",
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
    title: "Arcade Stick Parts UK | ArcadeStickLabs",
    description:
      "Shop Sanwa, Seimitsu, Crown and Brook arcade stick parts in the UK for custom builds, upgrades, and fight stick mods.",
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
        <Script
          id="business-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Store",
              "@id": `${baseUrl}/#store`,
              name: "ArcadeStickLabs",
              url: baseUrl,
              logo: `${baseUrl}/logo.png`,
              image: `${baseUrl}/og-image.png`,
              description:
                "ArcadeStickLabs is a UK specialist store for arcade stick parts, fight stick components, and custom build accessories from brands including Sanwa, Seimitsu, Crown, and Brook.",
              address: {
                "@type": "PostalAddress",
                addressCountry: "GB",
              },
              areaServed: {
                "@type": "Country",
                name: "United Kingdom",
              },
              brand: {
                "@type": "Brand",
                name: "ArcadeStickLabs",
              },
              sameAs: [
                "https://www.yelp.co.uk/biz/arcadesticklabs",
                "https://instagram.com/arcadesticklabs",
              ],
              keywords: [
                "arcade stick parts uk",
                "fight stick parts",
                "sanwa buttons uk",
                "seimitsu parts",
                "crown levers",
                "brook boards",
                "arcade stick upgrades",
              ],
              knowsAbout: [
                "Arcade stick parts",
                "Fight stick components",
                "Sanwa buttons",
                "Seimitsu buttons",
                "Korean levers",
                "Brook boards",
                "Fight stick upgrades",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer support",
                areaServed: "GB",
                availableLanguage: ["en-GB", "en"],
              },
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
          <NewsletterPopup />
          {children}
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
