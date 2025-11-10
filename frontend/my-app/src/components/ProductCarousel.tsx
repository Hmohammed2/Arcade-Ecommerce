"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from "@/library/getImageUrl";

export function ProductCarousel({
  featuredProducts,
}: {
  featuredProducts: any[];
}) {
  if (!featuredProducts || featuredProducts.length === 0) return null;

  return (
    <section
      id="featured"
      className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border-t border-gray-200 dark:border-gray-700"
    >
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-center text-gray-900 dark:text-gray-100">
          Featured Products
        </h2>
        <p className="mt-2 text-center text-gray-600 dark:text-gray-400">
          New arrivals and limited-edition arcade components — handpicked for
          the FGC.
        </p>

        {/* Swiper Carousel */}
        <div className="mt-10">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 4 },
            }}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            className="pb-10"
          >
            {featuredProducts.map((product: any) => {
              const isSoldOut = product.stock <= 0;

              const Card = (
                <div
                  className={`group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm transition-all duration-300 
                    ${!isSoldOut ? "hover:shadow-lg hover:-translate-y-1" : "opacity-60"}`}
                >
                  <div className="relative">
                    <Image
                      src={getImageUrl(product.image) || "/placeholder.png"}
                      alt={product.name}
                      width={400}
                      height={300}
                      className={`object-cover w-full h-56 transition-transform duration-300 
                        ${!isSoldOut ? "group-hover:scale-105" : ""}`}
                    />

                    {product.is_new && !isSoldOut && (
                      <span className="absolute top-3 left-3 bg-pink-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        New
                      </span>
                    )}

                    {isSoldOut && (
                      <div className="absolute inset-0 bg-black/65 flex items-center justify-center">
                        <span className="text-white text-sm font-semibold uppercase tracking-wide bg-black/80 px-3 py-1 rounded">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-pink-600 font-bold text-sm">
                      £{Number(product.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              );

              return (
                <SwiperSlide key={product.id}>
                  {isSoldOut ? (
                    <div className="cursor-not-allowed">{Card}</div>
                  ) : (
                    <Link href={`/products/${product.slug}`}>{Card}</Link>
                  )}
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/shop"
            className="inline-block px-6 py-2 text-sm font-semibold text-white bg-pink-600 rounded-full shadow-md hover:bg-pink-700 dark:hover:bg-pink-500 transition-all duration-200"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}
