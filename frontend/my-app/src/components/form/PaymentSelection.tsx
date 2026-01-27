"use client";

import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/library/loadStripe";
import { useEffect, useState } from "react";
import { useCheckout } from "@/hooks/useCheckout";
import { useCart } from "@/store/useCart";
import { useCheckoutForm } from "@/store/useCheckoutForm";
import { useCoupon } from "@/store/useCoupon";
import { toast } from "react-hot-toast";
import PaymentForm from "./PaymentForm";

type Props = {
  paymentMethod: "stripe" | "paypal";
  onChange: (method: "stripe" | "paypal") => void;
};

const buildLineItems = (cartItems: any[]) =>
  cartItems.map((item) =>
    item.type === "bundle"
      ? {
          type: "bundle",
          bundle_id: item.id,
          quantity: item.quantity,
          option_values: item.option_values || {},
        }
      : {
          type: "product",
          product_id: item.id,
          quantity: item.quantity,
          colour: item.colour ?? null,
        },
  );

export default function PaymentSelection({ paymentMethod, onChange }: Props) {
  const checkoutMutation = useCheckout();
  const { getCartItems } = useCart();
  const { formData } = useCheckoutForm();
  const { code: couponCode, isValid } = useCoupon();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderPublicId, setOrderPublicId] = useState<string | null>(null);
  const [loadingIntent, setLoadingIntent] = useState(false);

  // Create Stripe PaymentIntent when ready
  useEffect(() => {
    if (paymentMethod !== "stripe") return;

    if (
      !formData.shippingMethod ||
      !formData.shippingPostcode ||
      !formData.billingEmail ||
      getCartItems().length === 0
    ) {
      return;
    }

    let cancelled = false;

    const createIntent = async () => {
      try {
        setLoadingIntent(true);

        const payload = {
          first_name: formData.billingFirstName,
          last_name: formData.billingLastName,
          items: buildLineItems(getCartItems()),
          shipping_name: `${formData.billingFirstName} ${formData.billingLastName}`,
          shipping_method_name: formData.shippingMethod,
          shipping_postcode: formData.shippingPostcode,
          shipping_country: formData.shippingCountry || "GB",
          shipping_address1: formData.shippingAddress1,
          shipping_address2: formData.shippingAddress2,
          shipping_city: formData.shippingCity,
          email: formData.billingEmail,
          coupon_code: isValid ? couponCode : null,
        };

        const res = await checkoutMutation.mutateAsync(payload);

        if (!cancelled) {
          setClientSecret(res.clientSecret);
          setOrderPublicId(res.order_id);
        }
      } catch (err: any) {
        toast.error(err.message || "Unable to initialise payment");
        setClientSecret(null);
      } finally {
        setLoadingIntent(false);
      }
    };

    createIntent();

    return () => {
      cancelled = true;
    };
  }, [
    paymentMethod,
    formData.shippingMethod,
    formData.shippingPostcode,
    formData.billingEmail,
    couponCode,
    isValid,
  ]);

  return (
    <section className="space-y-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
      <h2 className="text-xl font-semibold">Payment Method</h2>
      <p className="text-sm text-gray-500">
        All transactions are secure and encrypted
      </p>

      {/* Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <PaymentOption
          active={paymentMethod === "stripe"}
          onClick={() => onChange("stripe")}
          title="Pay with Card / Wallet"
          subtitle="Visa, Mastercard, Amex, Apple Pay, Google Pay"
        />

        <PaymentOption
          active={paymentMethod === "paypal"}
          onClick={() => onChange("paypal")}
          title="Pay with PayPal"
          subtitle="Fast checkout"
        />
      </div>

      {/* Accordion content */}
      {paymentMethod === "stripe" && (
        <>
          {loadingIntent && (
            <p className="text-sm text-gray-500">Preparing secure payment…</p>
          )}

          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm method="stripe" orderPublicId={orderPublicId!} />
            </Elements>
          )}
        </>
      )}
      {paymentMethod === "paypal" && <PaymentForm method="paypal" />}
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
      className={`rounded-lg border p-4 text-left transition
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
