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
