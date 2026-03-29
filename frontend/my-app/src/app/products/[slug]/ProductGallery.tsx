"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Product } from "@/types/product";
import { getImageUrl } from "@/library/getImageUrl";
import { ZoomModal } from "@/components/ZoomModal";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

export default function ProductGallery({ product }: { product: Product }) {
  const images = useMemo(() => {
    const primary = product.image ? [product.image] : [];
    const gallery =
      product.images?.map((img) => img.image).filter(Boolean) ?? [];
    return [...primary, ...gallery];
  }, [product]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const selected = images[selectedIndex];

  if (!images.length) return null;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPos({ x, y });
  };

  const prev = () => {
    setIsZoomed(false);
    setSelectedIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  };

  const next = () => {
    setIsZoomed(false);
    setSelectedIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  return (
    <div className="md:col-span-5 flex flex-col gap-4">
      {/* ===================== */}
      {/* DESKTOP */}
      {/* ===================== */}
      <div className="hidden md:flex flex-col gap-4">
        {/* MAIN IMAGE */}
        <div
          onMouseMove={handleMouseMove}
          className="relative group overflow-hidden rounded-lg bg-white dark:bg-gray-900"
        >
          <ZoomModal
            src={getImageUrl(selected)}
            alt={product.name}
            trigger={(open) => (
              <button
                onClick={(e) => {
                  e.preventDefault();

                  // toggle zoom
                  setIsZoomed((z) => !z);
                }}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  open(); // open modal on double click
                }}
                className={`
                  relative w-full h-[45vh] max-h-[400px] min-h-[250px] overflow-hidden
                  ${isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"}
                `}
              >
                <Image
                  src={getImageUrl(selected)}
                  alt={product.name}
                  fill
                  className="object-contain transition-transform duration-200"
                  style={{
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    transform: isZoomed ? "scale(2)" : "scale(1)",
                  }}
                />

                {/* subtle hint */}
                {!isZoomed && (
                  <span className="absolute bottom-2 right-2 text-xs bg-black/60 text-white px-2 py-1 rounded">
                    Click to zoom
                  </span>
                )}
              </button>
            )}
          />

          {/* LEFT ARROW */}
          <button
            onClick={prev}
            className="
              absolute left-3 top-1/2 -translate-y-1/2
              bg-white/80 dark:bg-black/60
              hover:bg-white dark:hover:bg-black
              text-black dark:text-white
              rounded-full p-2 shadow
            "
          >
            <ChevronLeft size={20} />
          </button>

          {/* RIGHT ARROW */}
          <button
            onClick={next}
            className="
              absolute right-3 top-1/2 -translate-y-1/2
              bg-white/80 dark:bg-black/60
              hover:bg-white dark:hover:bg-black
              text-black dark:text-white
              rounded-full p-2 shadow
            "
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* THUMBNAILS */}
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, i) => {
            const isActive = selectedIndex === i;

            return (
              <button
                key={i}
                onClick={() => {
                  setSelectedIndex(i);
                  setIsZoomed(false);
                }}
                className={`relative w-20 h-20 flex-shrink-0 border rounded-md overflow-hidden ${
                  isActive
                    ? "border-black dark:border-white"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <Image
                  src={getImageUrl(img)}
                  alt={`${product.name} thumb ${i}`}
                  fill
                  className="object-contain"
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* ===================== */}
      {/* MOBILE (SWIPER) */}
      {/* ===================== */}
      <div className="md:hidden">
        <Swiper navigation modules={[Navigation]}>
          {images.map((img, i) => (
            <SwiperSlide key={i}>
              <ZoomModal
                src={getImageUrl(img)}
                alt={product.name}
                trigger={(open) => (
                  <button onClick={open} className="relative w-full h-[400px]">
                    <Image
                      src={getImageUrl(img)}
                      alt={`${product.name} view ${i + 1}`}
                      fill
                      className="object-contain"
                    />
                  </button>
                )}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
