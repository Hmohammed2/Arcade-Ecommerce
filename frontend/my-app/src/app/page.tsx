// app/page.tsx (or wherever LandingPage lives)
import { fetchProducts } from "@/library/fetchProducts";
import Link from "next/link";
import { Package, Box, Truck } from "lucide-react";
import { ProductCarousel } from "@/components/ProductCarousel";

export default async function LandingPage() {
  // 🔹 Single server-side fetch only
  const products = await fetchProducts();

  const featuredProducts = products.filter((p: any) => p.is_featured);

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-100 flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300">
      <main className="flex-grow">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/arcade-image.png')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/70 via-black/70 to-pink-900/70" />
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
              Build Your Arcade Stick The Right Way
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-gray-200 dark:text-gray-300">
              Curated arcade parts from Sanwa, Seimitsu, Brook, and more.
              Small-batch quantities, fast UK shipping, and builder-friendly
              bundles.
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

        {/* FEATURED PRODUCTS */}
        <ProductCarousel featuredProducts={featuredProducts} />

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
