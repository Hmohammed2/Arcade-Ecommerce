import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import AuthHydration from "@/components/middleware/AuthHydration"; // 👈 new small client wrapper
import QueryProvider from "./providers/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ArcadeStickLabs — Custom Arcade Parts & Fightstick Kits",
  description:
    "Join the waitlist for curated arcade parts and starter kits. Premium arcade components from Sanwa, Seimitsu, Brook, and more.",
  keywords: [
    "arcade parts",
    "fightstick kits",
    "custom arcade stick",
    "Sanwa",
    "Seimitsu",
    "Brook",
    "FGC UK",
    "arcade parts UK",
  ],
  openGraph: {
    title: "ArcadeStickLabs — Custom Arcade Parts & Fightstick Kits",
    description:
      "Build your arcade stick with curated Sanwa, Seimitsu, Brook, and more. UK-based supplier with fast EU shipping.",
    url: "https://arcadesticklabs.co.uk",
    siteName: "ArcadeStickLabs",
    images: [
      {
        url: "https://arcadesticklabs.co.uk/og-image.png", // ensure you create/upload this
        width: 1200,
        height: 630,
        alt: "ArcadeStickLabs Custom Arcade Parts",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@ArcadeStickLabs", // your Twitter handle if available
    title: "ArcadeStickLabs — Custom Arcade Parts & Fightstick Kits",
    description: "Join the waitlist for curated arcade parts and starter kits.",
    images: ["https://arcadesticklabs.co.uk/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://arcadesticklabs.co.uk" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <AuthHydration /> {/* Runs useAuth() + fetchUser client-side */}
          <Navbar />
          {children}
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
