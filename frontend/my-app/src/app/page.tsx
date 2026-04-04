// app/page.tsx (or wherever LandingPage lives)
export const dynamic = "force-dynamic";
import { fetchProducts } from "@/library/fetchProducts";
import { ProductCarousel } from "@/components/ProductCarousel";
import type { Metadata } from "next";
import Script from "next/script";
import { Product } from "@/types/product";
import { Hero } from "@/components/hero";
import { Testimonials } from "@/components/Testimonials";
import About from "@/components/AboutSection";
import BrandVideo from "@/components/BrandVideo";
import Footer from "@/components/footer";

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

  const featuredProducts = products.filter((p: Product) => p.is_featured);

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
          <Hero />

          {/* TESTIMONIAL BRIDGE SECTION */}
          <Testimonials />

          {/* FEATURED PRODUCTS */}
          <ProductCarousel featuredProducts={featuredProducts} />

          <BrandVideo />

          {/* About Us */}
          <About />

          <Footer />
        </main>
      </div>
    </>
  );
}
