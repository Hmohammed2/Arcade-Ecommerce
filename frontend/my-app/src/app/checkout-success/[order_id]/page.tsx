// app/checkout-success/[order_id]/page.tsx
import { Metadata } from "next";
import CheckoutSuccessClient from "./CheckoutSuccessClient";

interface Params {
  order_id: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { order_id } = await params;
  return {
    title: `Order #${order_id} - Checkout Success`,
    description:
      "Thank you for your purchase! Your order was placed successfully.",
  };
}

// ✅ Server component
export default async function CheckoutSuccessPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { order_id } = await params;

  // This runs on the server — no browser access
  // Pass order_id down to the client component
  return (
    <div className="dark:bg-gray-900">
      {" "}
      <CheckoutSuccessClient orderId={order_id} />{" "}
    </div>
  );
}
