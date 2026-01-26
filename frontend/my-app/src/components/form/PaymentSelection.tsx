"use client";

import PaymentForm from "./PaymentForm";

type Props = {
  paymentMethod: "stripe" | "paypal";
  onChange: (method: "stripe" | "paypal") => void;
};

export default function PaymentSelection({ paymentMethod, onChange }: Props) {
  return (
    <section className="space-y-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      <h2 className="text-xl font-semibold">Payment Method</h2>
      <p className="text-sm">All transactions are secure and encrypted</p>
      {/* Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <PaymentOption
          active={paymentMethod === "stripe"}
          onClick={() => onChange("stripe")}
          title="Pay with Card"
          subtitle="Visa, Mastercard, Amex"
        />

        <PaymentOption
          active={paymentMethod === "paypal"}
          onClick={() => onChange("paypal")}
          title="Pay with PayPal"
          subtitle="Fast checkout"
        />
      </div>

      {/* Accordion panel */}
      <div className="mt-4">
        <PaymentForm method={paymentMethod} />
      </div>
    </section>
  );
}

function PaymentOption({
  active,
  onClick,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-lg border p-4 transition
        ${
          active
            ? "border-pink-600 bg-pink-50 dark:bg-pink-900/20"
            : "border-gray-300 dark:border-gray-700"
        }
      `}
    >
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-gray-500">{subtitle}</div>
    </button>
  );
}
