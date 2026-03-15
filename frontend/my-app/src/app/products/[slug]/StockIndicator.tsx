export function StockIndicator({ stock }: { stock: number }) {
  if (stock === 0) {
    return <div className="text-sm text-gray-400">Out of stock</div>;
  }

  return (
    <div className="space-y-1 text-sm">
      {stock > 10 && (
        <span className="text-green-600 font-medium">✔ In stock</span>
      )}

      {stock <= 10 && stock > 5 && (
        <span className="text-orange-500 font-medium">
          Only {stock} remaining
        </span>
      )}

      {stock <= 5 && (
        <span className="text-red-600 font-semibold">
          ⚠ Only {stock} left in stock
        </span>
      )}

      <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            stock > 10
              ? "bg-green-500"
              : stock > 5
                ? "bg-orange-400"
                : "bg-red-500"
          }`}
          style={{
            width: `${Math.min((stock / 10) * 100, 100)}%`,
          }}
        />
      </div>
    </div>
  );
}
