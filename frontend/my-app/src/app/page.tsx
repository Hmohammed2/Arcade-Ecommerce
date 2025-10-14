import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { fetchProducts } from "@/library/fetchProducts";
import Link from "next/link";

export default async function LandingPage() {
  const queryClient = new QueryClient();

  // Prefetch products server-side
  await queryClient.prefetchQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <div className="min-h-screen text-gray-800 dark:text-gray-100 flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300">
        {/* Hero Section */}
        <main className="flex-grow">
          <section className="relative overflow-hidden">
            {/* Background image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/arcade-image.png')" }}
            />
            {/* Dark overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/70 via-black/70 to-pink-900/70" />
            {/* Grid overlay */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />

            {/* Hero content */}
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

          {/* About us */}
          <section
            className="bg-white dark:bg-gray-900 transition-colors duration-300"
            id="about"
          >
            <div className="max-w-7xl mx-auto px-6 py-16 text-center">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                About ArcadeStickLabs
              </h2>
              <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                At ArcadeStickLabs, we set out to solve a challenge every UK
                fightstick builder knows too well: finding reliable arcade parts
                without waiting weeks for international shipping. For years,
                enthusiasts across the UK and Europe have had to import
                components from Japan or the US, often facing high costs,
                customs delays, and uncertainty about compatibility.
              </p>
              <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                We built ArcadeStickLabs to change that. Based here in the UK,
                we supply curated, tournament-grade parts from trusted brands
                like Sanwa, Seimitsu, Brook, and Crown, all stocked locally and
                ready to ship quickly. Whether you’re a casual player looking to
                customise your first stick, a competitor chasing precision, or a
                modder experimenting with new builds, we make it simple to get
                the right parts when you need them.
              </p>
              <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                No more expensive overseas orders or long waits at customs—just
                quality arcade gear, fast UK delivery, and the confidence that
                you’re building with components the fighting game community
                relies on. ArcadeStickLabs exists to support the FGC here at
                home and help you craft your perfect stick without compromise.
              </p>
            </div>
          </section>

          {/* Features */}
          <section
            id="products"
            className="bg-gradient-to-br from-indigo-50 via-white to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300"
          >
            <div className="max-w-7xl mx-auto px-6 py-16">
              <h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-gray-100">
                Why choose us
              </h2>
              <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                <Feature
                  title="Curated parts"
                  desc="Only trusted brands, tested for compatibility."
                />
                <Feature
                  title="Small minimums"
                  desc="Buy exactly what you need — no bulk required."
                />
                <Feature
                  title="Fast shipping"
                  desc="Local UK/EU warehousing for quick delivery."
                />
              </div>
            </div>
          </section>
        </main>
      </div>
    </HydrationBoundary>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h4>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{desc}</p>
    </div>
  );
}
