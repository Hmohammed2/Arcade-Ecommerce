// app/page.tsx (or wherever LandingPage lives)
export const dynamic = "force-dynamic";
import { fetchProducts } from "@/library/fetchProducts";
import Link from "next/link";
import { Package, Box, Truck } from "lucide-react";
import { ProductCarousel } from "@/components/ProductCarousel";
import type { Metadata } from "next";
import Script from "next/script";
import Image from "next/image";

const SITE_URL = "https://arcadesticklabs.co.uk";

export const metadata: Metadata = {
  title: "Arcade Stick Parts UK | Sanwa Buttons, Brook PCBs & Fightstick Mods",
  description:
    "ArcadeStickLabs is the UK store for arcade stick parts and fightstick upgrades. Shop genuine Sanwa buttons, Brook PCBs, joysticks and modding components with fast UK shipping. Built for Tekken, Street Fighter and the FGC community.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "Arcade Stick Parts UK | Fightstick Parts & Modding Store",
    description:
      "The UK home for arcade stick parts and fightstick upgrades. Genuine Sanwa, Seimitsu and Brook hardware with fast UK shipping. Trusted by the Fighting Game Community.",
    url: SITE_URL,
    siteName: "ArcadeStickLabs",
    images: [
      {
        url: `${SITE_URL}/og-homepage.jpg`,
        width: 1200,
        height: 630,
        alt: "ArcadeStickLabs – UK Arcade Stick Parts Store",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Arcade Stick Parts UK | Sanwa, Brook & Fightstick Mods",
    description:
      "Shop arcade stick parts in the UK. Sanwa buttons, Brook PCBs, joysticks and fightstick upgrades with fast shipping for FGC players.",
    images: [`${SITE_URL}/og-homepage.jpg`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function LandingPage() {
  // 🔹 Single server-side fetch only
  const products = await fetchProducts();

  const featuredProducts = products.filter((p: any) => p.is_featured);

  return (
    <>
      <Script
        id="homepage-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": "https://arcadesticklabs.co.uk/#organization",
                name: "ArcadeStickLabs",
                url: "https://arcadesticklabs.co.uk",
                logo: {
                  "@type": "ImageObject",
                  url: "https://arcadesticklabs.co.uk/logo.png",
                },
                sameAs: ["https://www.instagram.com/arcadesticklabs"],
              },
              {
                "@type": "WebSite",
                "@id": "https://arcadesticklabs.co.uk/#website",
                url: "https://arcadesticklabs.co.uk",
                name: "ArcadeStickLabs",
                publisher: {
                  "@id": "https://arcadesticklabs.co.uk/#organization",
                },
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate:
                      "https://arcadesticklabs.co.uk/shop?search={search_term_string}",
                  },
                  "query-input": "required name=search_term_string",
                },
              },
            ],
          }),
        }}
      />

      <div className="min-h-screen text-gray-800 dark:text-gray-100 flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300">
        <main className="flex-grow">
          {/* HERO SECTION */}
          <section className="relative overflow-hidden">
            <Image
              src="/arcade-image.webp"
              alt="ArcadeStickLabs arcade stick parts hero"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />

            {/* GRADIENT OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/70 via-black/70 to-pink-900/70" />

            {/* GRID OVERLAY */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            <div className="relative max-w-4xl mx-auto px-6 py-32 text-center text-white">
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                UK Arcade Stick Parts & Fightstick Builder Store
              </h1>
              <p className="mt-6 max-w-3xl mx-auto text-gray-200 dark:text-gray-300 text-lg">
                ArcadeStickLabs is the UK home for arcade stick parts, Sanwa
                buttons, Brook PCBs, joystick upgrades and custom fightstick
                components for Tekken, Street Fighter, Guilty Gear and the FGC
                community. Build, mod and upgrade your arcade stick with fast UK
                shipping and builder-approved parts.
              </p>

              <div className="mt-8">
                <Link
                  href="/shop"
                  className="inline-block px-8 py-3 text-lg font-semibold text-white bg-pink-600 rounded-full shadow-md hover:bg-pink-700 dark:hover:bg-pink-500 hover:shadow-lg transition-all duration-200"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </section>

          {/* TESTIMONIAL BRIDGE SECTION */}
          <section className="bg-gradient-to-b from-white to-pink-50 dark:from-gray-900 dark:to-gray-800">
            <div className="py-10 max-w-2xl mx-auto px-6">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center shadow-sm border-t-4 border-t-pink-500">
                <div className="text-yellow-400 text-lg mb-1">⭐⭐⭐⭐⭐</div>

                <p className="italic text-sm md:text-base text-gray-800 dark:text-gray-100">
                  “Genuinely great Sanwa parts — it’s brilliant to buy genuine
                  parts from a UK supplier and avoid the knockoff gamble.”
                </p>

                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  — Kevin M. • Verified Customer
                </p>
              </div>
            </div>
          </section>

          {/* FEATURED PRODUCTS */}
          <ProductCarousel featuredProducts={featuredProducts} />

          <section className="bg-white dark:bg-gray-900">
            <div className="max-w-6xl mx-auto px-6 py-16">
              <h2 className="text-2xl md:text-3xl font-bold text-center">
                Built for the Fighting Game Community
              </h2>

              <p className="mt-6 text-center max-w-4xl mx-auto text-gray-600 dark:text-gray-300">
                We specialise in arcade stick parts for competitive FGC players
                across the UK and EU. Whether you’re upgrading a Mad Catz,
                Qanba, Hori or building a custom fightstick from scratch, we
                stock genuine Sanwa, Seimitsu and Brook hardware trusted by
                tournament players. Perfect for Tekken 8, Street Fighter 6,
                Guilty Gear Strive, Mortal Kombat and more.
              </p>
            </div>
          </section>

          <section className="bg-gradient-to-br from-pink-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            <div className="max-w-6xl mx-auto px-6 py-14 grid md:grid-cols-3 gap-6 text-center">
              <Trust
                title="Genuine Japanese Parts"
                desc="No clones. Only official Sanwa, Seimitsu & Brook hardware."
              />
              <Trust
                title="FGC Tested"
                desc="All parts verified by real arcade stick builders & players."
              />
              <Trust
                title="UK Fast Shipping"
                desc="Local stock. No customs delays. No AliExpress waiting times."
              />
            </div>
          </section>

          {/* WHY CHOOSE US */}
          <section
            id="products"
            className="bg-gradient-to-br from-indigo-50 via-white to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300"
          >
            <div className="max-w-7xl mx-auto px-6 py-16">
              <h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-gray-100">
                Why Choose Us
              </h2>

              <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                <Feature
                  icon={
                    <Package className="w-8 h-8 text-pink-600 dark:text-pink-500" />
                  }
                  title="Curated Parts"
                  desc="Only trusted brands, tested for compatibility."
                />
                <Feature
                  icon={
                    <Box className="w-8 h-8 text-pink-600 dark:text-pink-500" />
                  }
                  title="Small Minimums"
                  desc="Buy exactly what you need — no bulk required."
                />
                <Feature
                  icon={
                    <Truck className="w-8 h-8 text-pink-600 dark:text-pink-500" />
                  }
                  title="Fast Shipping"
                  desc="Local UK/EU warehousing for quick delivery."
                />
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

function Trust({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
      <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
        {title}
      </h4>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{desc}</p>
    </div>
  );
}

function Feature({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 text-center">
      <div className="flex justify-center mb-4">{icon}</div>
      <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
        {title}
      </h4>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{desc}</p>
    </div>
  );
}
