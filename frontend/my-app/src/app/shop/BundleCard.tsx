import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/library/getImageUrl";
import { useCart } from "@/store/useCart";
import { Bundle } from "@/types/bundle";

export default function BundleCard({ bundle }: { bundle: Bundle }) {
  const { addItem, updateQuantity, getItemCount } = useCart();

  const qty = getItemCount(bundle.id, "bundle");
  const outOfStock = !bundle.is_in_stock;

  return (
    <Link
      href={`/bundles/${bundle.slug}`}
      className="flex flex-col flex-1 rounded-xl border bg-white dark:bg-gray-800 overflow-hidden hover:shadow-lg transition"
    >
      {/* IMAGE AREA (matches product card) */}
      <div className="relative w-full aspect-square bg-gray-50 dark:bg-gray-700">
        <Image
          src={getImageUrl(bundle.image)}
          alt={bundle.name}
          fill
          className="object-contain p-4"
          sizes="(max-width: 768px) 100vw, 33vw"
          priority={false}
        />

        {/* Floating cart controls */}
        {!outOfStock && (
          <div className="absolute bottom-2 right-2">
            {qty === 0 ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addItem({
                    type: "bundle",
                    id: bundle.id,
                    title: bundle.name,
                    price: Number(bundle.price),
                    image: bundle.image ?? undefined,
                    quantity: 1,
                  });
                }}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-[#14485A] text-white text-xl shadow-md hover:bg-[#0e2f3d] transition"
              >
                +
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-white/95 dark:bg-gray-900/95 rounded-full shadow-md px-2 py-1">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    updateQuantity(bundle.id, "bundle", qty - 1);
                  }}
                  className={`flex items-center justify-center w-7 h-7 rounded-full border text-sm font-bold transition ${
                    qty === 1
                      ? "border-[#E01D42] text-[#E01D42] hover:bg-[#E01D42] hover:text-white"
                      : "border-[#14485A] text-[#14485A] hover:bg-[#14485A] hover:text-white"
                  }`}
                >
                  {qty === 1 ? "🗑" : "−"}
                </button>

                <span className="min-w-[1.5rem] text-center text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {qty}
                </span>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    updateQuantity(bundle.id, "bundle", qty + 1);
                  }}
                  className="flex items-center justify-center w-7 h-7 rounded-full border border-[#14485A] text-[#14485A] text-sm font-bold hover:bg-[#14485A] hover:text-white transition"
                  disabled={qty >= bundle.max_available}
                >
                  +
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* TEXT AREA */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold">{bundle.name}</h3>
        <p className="text-[#E01D42] font-bold">£{bundle.price}</p>

        <p
          className={`text-sm ${
            outOfStock ? "text-red-500" : "text-green-600"
          }`}
        >
          {outOfStock
            ? "Out of Stock"
            : `In Stock — ${bundle.max_available} kits`}
        </p>

        <p className="mt-2 text-sm opacity-80">{bundle.short_description}</p>
      </div>
    </Link>
  );
}
