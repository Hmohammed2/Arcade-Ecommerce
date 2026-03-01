import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section
      id="home"
      className="
        relative
        bg-gradient-to-br
        from-white to-pink-50/40
        dark:from-gray-900 dark:to-gray-800
        transition-colors
      "
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* LEFT: TEXT CONTENT */}
          <div className="space-y-8">
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-gray-900 dark:text-white">
              Build a{" "}
              <span className="text-pink-600">Tournament-Ready Fightstick</span>{" "}
              — Without Import Hassle
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-xl">
              Genuine Sanwa buttons, Brook PCBs and trusted arcade components —
              stocked in the UK with fast dispatch and no surprise fees.
            </p>

            {/* Trust Strip */}
            <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-700 dark:text-gray-300">
              <span>🚚 Fast UK Shipping</span>
              <span>🔒 Secure Checkout</span>
              <span>🎮 FGC Trusted Parts</span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/shop"
                className="
                  inline-flex items-center gap-2
                  bg-pink-600 text-white
                  px-8 py-3
                  rounded-md
                  font-semibold
                  hover:bg-pink-700
                  transition-colors
                "
              >
                Shop Parts
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                href="/bundles"
                className="
                  inline-flex items-center gap-2
                  bg-white dark:bg-gray-800
                  text-gray-900 dark:text-white
                  px-8 py-3
                  rounded-md
                  border border-gray-300 dark:border-gray-600
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  transition-colors
                "
              >
                View Starter Kits
              </Link>
            </div>
          </div>

          {/* RIGHT: HERO IMAGE */}
          <div className="relative">
            <div className="relative aspect-[4/5] md:aspect-[5/4] rounded-xl overflow-hidden shadow-xl">
              <Image
                src="/hero-image.webp"
                alt="ArcadeStickLabs arcade stick parts"
                fill
                priority
                className="object-cover object-center"
              />
            </div>

            {/* Soft accent shape */}
            <div
              className="
                absolute -bottom-6 -right-6
                w-32 h-32
                bg-pink-600/10
                rounded-xl
                -z-10
              "
            />
          </div>
        </div>
      </div>
    </section>
  );
}
