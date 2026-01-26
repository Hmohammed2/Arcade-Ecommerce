function FastPaySection() {
  const { formData } = useCheckoutForm();

  const disabled = !formData.shippingRateId;

  return (
    <div className="rounded-lg border p-4 bg-yellow-50">
      <p className="text-sm text-gray-700 mb-2">Fast checkout with PayPal</p>

      {disabled && (
        <p className="text-xs text-red-600 mb-2">
          Select a shipping method to continue
        </p>
      )}

      <div
        className={`relative ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      >
        <div id="paypal-fast-button" />
      </div>
    </div>
  );
}
