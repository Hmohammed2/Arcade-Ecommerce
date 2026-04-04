import Image from "next/image";

export default function About() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="relative rounded-xl overflow-hidden shadow-lg aspect-square">
            <Image
              src="/about_picture.webp"
              alt="Packing arcade stick parts"
              fill
              className="object-cover"
            />
          </div>

          {/* Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Built by a Player, Not a Marketplace
            </h2>

            <div className="space-y-5 text-gray-600 dark:text-gray-300 leading-relaxed">
              <p>I’m Hamza, founder of ArcadeStickLabs.</p>

              <p>
                I started this store after struggling to find reliable, genuine
                arcade parts in the UK without inflated shipping, long delays or
                questionable quality.
              </p>

              <p>
                Every component stocked here is chosen with long-term
                reliability and real gameplay use in mind — not just resale
                value.
              </p>

              <p>
                This isn’t a dropship operation. It’s a focused, UK-based
                specialist store built for players who care about their setup.
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 flex flex-wrap gap-4 text-sm font-semibold">
              <div className="bg-black text-white px-4 py-2 rounded-md">
                UK Based
              </div>

              <div className="bg-pink-600 text-white px-4 py-2 rounded-md">
                Genuine Parts Only
              </div>

              <div className="bg-gray-200 dark:bg-gray-800 px-4 py-2 rounded-md">
                Enthusiast Run
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
