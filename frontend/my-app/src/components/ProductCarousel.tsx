"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
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
    <section id="products" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-3">
            Featured <span className="text-pink-600">Products</span>
          </h2>

          <p className="text-lg text-gray-700">
            Check out our most popular arcade parts and components
          </p>
        </div>

        {/* Carousel */}
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          navigation
          pagination={{ clickable: true }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          className="pb-12"
        >
          {featuredProducts.map((product) => {
            const isSoldOut = product.stock <= 0;

            return (
              <SwiperSlide key={product.id}>
                <div className="px-2">
                  <Link
                    href={`/products/${product.slug}`}
                    className="block group"
                  >
                    <div
                      className={`
          border-2 border-black bg-white overflow-hidden
          transition-all duration-300 cursor-pointer
          ${!isSoldOut ? "group-hover:shadow-xl group-hover:-translate-y-1" : "opacity-60"}
        `}
                    >
                      {/* Image */}
                      <div className="aspect-square bg-gray-100 overflow-hidden relative">
                        <Image
                          src={getImageUrl(product.image)}
                          alt={product.name}
                          fill
                          className={`
              object-cover transition-transform duration-300
              ${!isSoldOut ? "group-hover:scale-105" : ""}
            `}
                        />

                        {product.is_new && !isSoldOut && (
                          <div className="absolute top-3 left-3 bg-pink-600 text-white text-xs font-bold px-3 py-1 border-2 border-black">
                            NEW
                          </div>
                        )}

                        {isSoldOut && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            <span className="bg-black text-white px-4 py-2 border-2 border-white font-bold text-sm">
                              SOLD OUT
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2 group-hover:text-pink-600 transition-colors">
                          {product.name}
                        </h3>

                        <span className="text-2xl font-bold text-pink-600">
                          £{product.price}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            href="/shop"
            className="
              inline-block
              bg-pink-600 text-white
              px-6 py-3
              border-2 border-black
              font-bold
              hover:bg-pink-700
              transition-colors
            "
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}
