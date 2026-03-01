import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/library/getImageUrl";
import { Bundle } from "@/types/bundle";

export default function BundleCard({ bundle }: { bundle: Bundle }) {
  const outOfStock = !bundle.is_in_stock;

  return (
    <Link
      href={`/bundles/${bundle.slug}`}
      className="flex flex-col rounded-xl bg-white shadow hover:shadow-lg transition"
    >
      <div className="relative aspect-square bg-gray-50">
        <Image
          src={getImageUrl(bundle.image)}
          alt={bundle.name}
          fill
          className="object-contain p-4"
        />
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-lg font-semibold">{bundle.name}</h3>
        <p className="text-pink-600 font-bold">£{bundle.price}</p>

        <p
          className={`text-sm ${
            outOfStock ? "text-red-500" : "text-green-600"
          }`}
        >
          {outOfStock ? "Out of Stock" : "In Stock"}
        </p>

        <p className="mt-2 text-sm opacity-80">{bundle.short_description}</p>
      </div>
    </Link>
  );
}
