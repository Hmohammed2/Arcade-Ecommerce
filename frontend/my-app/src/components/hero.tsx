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
        from-pink-50 to-white
        dark:from-gray-900 dark:to-gray-800
        border-b-2 border-black dark:border-gray-700
        transition-colors
      "
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-6">
            <h1
              className="
              text-5xl md:text-6xl font-bold leading-tight
              text-black dark:text-white
            "
            >
              UK Premium Arcade Stick Parts & Fightstick for{" "}
              <span className="text-pink-600">True Enthusiasts</span>
            </h1>

            <p
              className="
              text-lg
              text-gray-700 dark:text-gray-300
            "
            >
              ArcadeStickLabs is the UK home for arcade stick parts, Sanwa
              buttons, Brook PCBs, joystick upgrades and custom fightstick
              components for Tekken, Street Fighter, Guilty Gear and the FGC
              community. Build, mod and upgrade your arcade stick with fast UK
              shipping and builder-approved parts.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="
                  inline-flex items-center gap-2
                  bg-pink-600 text-white
                  px-8 py-3
                  border-2 border-black dark:border-gray-700
                  hover:bg-pink-700
                  transition-colors
                "
              >
                Shop Now
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                href="#products"
                className="
                  inline-flex items-center gap-2
                  bg-white dark:bg-gray-800
                  text-black dark:text-white
                  px-8 py-3
                  border-2 border-black dark:border-gray-700
                  hover:bg-pink-700 hover:text-white
                  transition-colors
                "
              >
                View Catalog
              </Link>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div
              className="
              relative border-4
              border-black dark:border-gray-700
              overflow-hidden
              aspect-[2/3] md:aspect-[5/4]
            "
            >
              <Image
                src="/hero-image.webp"
                alt="ArcadeStickLabs arcade stick parts hero"
                fill
                priority
                className="object-cover object-center"
              />
            </div>

            {/* Decorative block */}
            <div
              className="
              absolute -bottom-4 -right-4
              w-32 h-32
              bg-pink-600
              border-2 border-black dark:border-gray-700
              -z-10"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
