import Image from "next/image";
import { Package, ShieldCheck, Truck, MessageCircle } from "lucide-react";

const features = [
  {
    icon: Package,
    title: "Curated Parts",
    description:
      "Carefully selected arcade components from trusted brands like Sanwa and Crown.",
  },
  {
    icon: ShieldCheck,
    title: "Authentic Components",
    description:
      "No knockoffs — only genuine parts suitable for competitive and enthusiast use.",
  },
  {
    icon: Truck,
    title: "UK-Based Shipping",
    description:
      "Ships directly from the UK, avoiding long international delays and import fees.",
  },
  {
    icon: MessageCircle,
    title: "Direct Support",
    description:
      "You're speaking directly with the person running the store — no outsourced support.",
  },
];

export default function About() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Founder section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          {/* Image */}
          <div className="order-2 md:order-1">
            <div className="border-2 border-black overflow-hidden relative aspect-square">
              <Image
                src="/about_picture.webp"
                alt="Packing arcade stick parts"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Text */}
          <div className="order-1 md:order-2">
            <h2 className="text-4xl font-bold mb-6">
              About <span className="text-pink-600">ArcadeStickLabs</span>
            </h2>

            <div className="space-y-4 text-lg text-gray-700">
              <p>Hi, I'm Hamza — the founder of ArcadeStickLabs.</p>

              <p>
                I started ArcadeStickLabs after struggling to find reliable,
                authentic arcade stick parts in the UK without excessive
                shipping costs or uncertainty around quality.
              </p>

              <p>
                This is a small, independent UK-based operation run by someone
                who actively builds, mods, and uses arcade sticks. Every part
                listed is selected with real players and long-term reliability
                in mind.
              </p>

              <p>
                My goal is to make high-quality arcade components more
                accessible to the UK and EU fighting game community — without
                the usual friction.
              </p>

              <p className="font-semibold text-gray-900">
                Thank you for supporting an independent enthusiast-run store.
              </p>
            </div>

            {/* Trust badges */}
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="border-2 border-black px-4 py-2 bg-black text-white font-semibold">
                UK Based
              </div>

              <div className="border-2 border-black px-4 py-2 bg-pink-600 text-white font-semibold">
                Independent Store
              </div>

              <div className="border-2 border-black px-4 py-2 font-semibold">
                Enthusiast Run
              </div>
            </div>
          </div>
        </div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={index}
                className="
                  border-2 border-black
                  p-6
                  bg-white
                  hover:bg-pink-50
                  transition-colors
                  text-center
                "
              >
                <div
                  className="
                    bg-pink-600
                    border-2 border-black
                    w-16 h-16
                    flex items-center justify-center
                    mx-auto mb-4
                  "
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>

                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
