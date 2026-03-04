import { Product } from "@/types/product";

export default function ProductSpecs({ product }: { product: Product }) {
  const features = product.features ?? [];

  if (!product.overview && features.length === 0) return null;

  return (
    <section className="md:col-span-12 space-y-4">
      {product.overview && (
        <div>
          <h3 className="text-lg font-semibold">Overview</h3>
          <p className="text-sm">{product.overview}</p>
        </div>
      )}

      {features.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold">Specifications</h3>

          <dl className="divide-y">
            {features.map((f, i) => (
              <div key={i} className="py-2 grid grid-cols-3">
                <dt className="text-gray-500">{f.label}</dt>
                <dd className="col-span-2">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </section>
  );
}
