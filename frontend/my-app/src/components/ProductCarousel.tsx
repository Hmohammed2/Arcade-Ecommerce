"use client";

import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from "@/library/getImageUrl";

export function ProductCarousel({
  featuredProducts,
}: {
  featuredProducts: {
    id: number;
    name: string;
    slug: string;
    price: number;
    stock: number;
    is_new: boolean;
    image: string;
  }[];
}) {
  if (!featuredProducts?.length) return null;

  return (
    <section className="py-20 bg-white dark:bg-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Popular <span className="text-pink-600">UK Stocked Parts</span>
          </h2>

          <p className="mt-3 text-gray-600 dark:text-gray-300">
            Trusted components chosen by the UK fighting game community.
          </p>
        </div>

        {/* Grid (no autoplay distraction) */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.slice(0, 4).map((product) => {
            const isSoldOut = product.stock <= 0;

            return (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group"
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition overflow-hidden">
                  {/* Image */}
                  <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
                    <Image
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {product.is_new && !isSoldOut && (
                      <div className="absolute top-3 left-3 bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded">
                        NEW
                      </div>
                    )}

                    {isSoldOut && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          SOLD OUT
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-pink-600 transition-colors">
                      {product.name}
                    </h3>

                    <p className="mt-2 text-pink-600 font-bold text-lg">
                      £{product.price}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/shop"
            className="inline-block bg-pink-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-pink-700 transition"
          >
            Browse All Parts
          </Link>
        </div>
      </div>
    </section>
  );
}
