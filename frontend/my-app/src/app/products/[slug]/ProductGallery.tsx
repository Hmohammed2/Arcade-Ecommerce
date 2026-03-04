import Image from "next/image";
import { useMemo, useState } from "react";
import { Product } from "@/types/product";
import { getImageUrl } from "@/library/getImageUrl";
import { ZoomModal } from "@/components/ZoomModal";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

export default function ProductGallery({ product }: { product: Product }) {
  const images = useMemo(() => {
    const primary = product.image ? [product.image] : [];
    const gallery =
      product.images?.map((img) => img.image).filter(Boolean) ?? [];
    return [...primary, ...gallery];
  }, [product]);

  const [selected, setSelected] = useState(images[0]);

  return (
    <div className="md:col-span-5">
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
                    className="object-cover"
                  />
                </button>
              )}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
