"use client";

import { useCheckoutForm } from "@/store/useCheckoutForm";
import { useCart } from "@/store/useCart";

export default function CheckoutProgress() {
  const { formData } = useCheckoutForm();
  const { getCartItems } = useCart();

  const hasCart = getCartItems().length > 0;

  const isBillingComplete =
    !!formData.billingFirstName &&
    !!formData.billingLastName &&
    !!formData.billingEmail;

  const isShippingComplete =
    !!formData.shippingAddress1 &&
    !!formData.shippingCity &&
    !!formData.shippingPostcode &&
    !!formData.shippingMethod;

  // 🔎 Determine Current Step
  let currentStep = 0;

  if (!hasCart) currentStep = 0;
  else if (!isBillingComplete) currentStep = 1;
  else if (!isShippingComplete) currentStep = 2;
  else currentStep = 3;

  const steps = [
    { label: "Cart", complete: hasCart },
    { label: "Details", complete: isBillingComplete },
    { label: "Delivery", complete: isShippingComplete },
    { label: "Payment", complete: false },
  ];

  return (
    <div
      className="
        sticky top-0 z-40 
        bg-white/95 dark:bg-gray-900/95 backdrop-blur
        border-b border-gray-200 dark:border-gray-700
        py-3 px-4 mb-6
        lg:static lg:bg-transparent lg:border-none lg:backdrop-blur-0
      "
    >
      <div className="flex items-center justify-between max-w-md mx-auto lg:max-w-none">
        {steps.map((step, index) => {
          const isCurrent = index === currentStep;

          return (
            <div key={step.label} className="flex items-center flex-1">
              {/* Step Circle */}
              <div
                className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold transition
                  ${
                    step.complete
                      ? "bg-green-600 text-white"
                      : isCurrent
                        ? "bg-blue-600 text-white"
                        : "bg-gray-300 text-gray-600"
                  }
                `}
              >
                {step.complete ? "✓" : index + 1}
              </div>

              {/* Label */}
              <span
                className={`ml-2 text-xs font-medium hidden sm:inline
                  ${
                    step.complete
                      ? "text-green-600"
                      : isCurrent
                        ? "text-blue-600"
                        : "text-gray-600 dark:text-gray-300"
                  }
                `}
              >
                {step.label}
              </span>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-[2px] mx-2 bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`h-[2px] ${
                      step.complete ? "bg-green-600" : "bg-transparent"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
