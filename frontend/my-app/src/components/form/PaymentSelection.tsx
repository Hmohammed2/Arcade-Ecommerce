"use client";

import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/library/loadStripe";
import { useState } from "react";
import { useCheckout } from "@/hooks/useCheckout";
import { useCart } from "@/store/useCart";
import { useCheckoutForm } from "@/store/useCheckoutForm";
import { useCoupon } from "@/store/useCoupon";
import { toast } from "react-hot-toast";
import PaymentForm from "./PaymentForm";
import { CartItem, LineItem } from "@/types/cart";
import { CreatePaymentIntentPayload } from "@/types/stripe";

type Props = {
  paymentMethod: "stripe" | "paypal";
  onChange: (method: "stripe" | "paypal") => void;
};

const buildLineItems = (cartItems: CartItem[]): LineItem[] =>
  cartItems.map(
    (item): LineItem =>
      item.type === "bundle"
        ? {
            type: "bundle",
            bundle_id: item.id,
            quantity: item.quantity,
            option_values: item.option_values ?? {},
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

  const cartItems = getCartItems();

  // 🔒 Strict readiness validation
  const isBillingComplete =
    formData.billingFirstName &&
    formData.billingLastName &&
    formData.billingEmail;

  const isDeliveryComplete =
    formData.shippingMethod &&
    formData.shippingPostcode &&
    formData.shippingAddress1 &&
    formData.shippingCity;

  const isReady =
    isBillingComplete && isDeliveryComplete && cartItems.length > 0;

  const createIntent = async () => {
    if (!isReady) {
      toast.error("Please complete delivery details before continuing.");
      return;
    }

    try {
      setLoadingIntent(true);

      const payload: CreatePaymentIntentPayload = {
        first_name: formData.billingFirstName,
        last_name: formData.billingLastName,
        items: buildLineItems(cartItems),
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

      const res = await checkoutMutation.mutateAsync(payload as any);

      setClientSecret(res.clientSecret);
      setOrderPublicId(res.order_id);
    } catch (err: any) {
      toast.error(err.message || "Unable to initialise payment");
      setClientSecret(null);
    } finally {
      setLoadingIntent(false);
    }
  };

  return (
    <section className="space-y-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
      <h2 className="text-xl font-semibold">Payment Method</h2>
      <p className="text-sm text-gray-500">
        All transactions are secure and encrypted
      </p>

      {/* Payment Selector */}
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

      {/* 🔒 Locked State */}
      {!isReady && (
        <div className="bg-amber-50 text-amber-700 text-sm p-3 rounded border border-amber-200">
          Complete billing and delivery details to unlock payment.
        </div>
      )}

      {/* STRIPE FLOW */}
      {paymentMethod === "stripe" && (
        <>
          {!clientSecret && isReady && (
            <button
              onClick={createIntent}
              disabled={loadingIntent}
              className="w-full bg-black text-white py-3 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {loadingIntent
                ? "Preparing secure payment..."
                : "Continue to Secure Payment"}
            </button>
          )}

          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm method="stripe" orderPublicId={orderPublicId!} />
            </Elements>
          )}
        </>
      )}

      {/* PAYPAL FLOW */}
      {paymentMethod === "paypal" && isReady && <PaymentForm method="paypal" />}
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
