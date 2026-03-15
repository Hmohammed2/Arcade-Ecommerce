export default function BundleInfo({ bundle }: any) {
  const totalIndividualPrice = bundle.items?.reduce(
    (acc: number, i: any) => acc + i.product.price * i.quantity,
    0,
  );

  const savings =
    totalIndividualPrice && bundle.price
      ? (totalIndividualPrice - bundle.price).toFixed(2)
      : null;

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">{bundle.name}</h1>

      {/* Savings badge */}
      {savings && Number(savings) > 0 && (
        <div className="inline-block bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm px-3 py-1 rounded-full font-medium">
          Save £{savings} vs buying separately
        </div>
      )}

      {/* Stock */}
      <p className={bundle.is_in_stock ? "text-green-600" : "text-red-500"}>
        {bundle.is_in_stock
          ? `In Stock — ${bundle.max_available} kits available`
          : "Out of Stock"}
      </p>

      {/* Bundle contents */}
      <div>
        <h3 className="text-sm font-semibold mb-2">Kit includes:</h3>

        <ul className="space-y-1 text-sm">
          {bundle.items?.map((i: any) => (
            <li key={i.product.id}>
              {i.quantity} × {i.product.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
