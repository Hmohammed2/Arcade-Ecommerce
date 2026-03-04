import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import { getImageUrl } from "@/library/getImageUrl";

export default function FrequentlyBoughtTogether({
  product,
}: {
  product: Product;
}) {
  const items = product.frequently_bought_together ?? [];

  if (!items.length) return null;

  return (
    <section className="md:col-span-12 mt-10">
      <h2 className="text-xl font-semibold mb-4">Frequently Bought Together</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/products/${item.slug}`}
            className="border rounded-lg p-3 hover:shadow-sm transition"
          >
            {item.image && (
              <div className="relative w-full h-32 mb-2">
                <Image
                  src={getImageUrl(item.image)}
                  alt={item.name}
                  fill
                  className="object-contain"
                />
              </div>
            )}

            <p className="text-sm font-medium">{item.name}</p>

            <p className="text-sm text-red-500">£{item.price}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
