type Props = {
  bundle: any;
  quantity: number;
  setQuantity: (n: number) => void;
  maxQty: number;
  onAdd: () => void;
  selectionsComplete: boolean;
};

export default function BundleBuyBox({
  bundle,
  quantity,
  setQuantity,
  maxQty,
  onAdd,
  selectionsComplete,
}: Props) {
  const disabled = !bundle.is_in_stock || !selectionsComplete;

  return (
    <div className="sticky top-24 border rounded-lg p-6 space-y-4 bg-white dark:bg-gray-800 shadow-sm">
      {/* Price */}
      <p className="text-3xl font-bold text-[#E01D42]">£{bundle.price}</p>

      {/* Quantity */}
      <div>
        <label className="text-sm font-medium block mb-1">Quantity</label>

        <select
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-full border rounded p-2 dark:bg-gray-700"
        >
          {Array.from({ length: maxQty }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      {/* Add to cart */}
      <button
        onClick={onAdd}
        disabled={disabled}
        className={`w-full py-3 rounded-lg font-semibold text-white transition
        ${
          disabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#14485A] hover:bg-[#0e2f3d]"
        }`}
      >
        {disabled ? "Select Colours First" : "Add Kit to Basket"}
      </button>

      {/* Trust signals */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>✔ Fast UK dispatch</p>
        <p>✔ Genuine arcade parts</p>
        <p>✔ Trusted by the UK FGC</p>
      </div>
    </div>
  );
}
