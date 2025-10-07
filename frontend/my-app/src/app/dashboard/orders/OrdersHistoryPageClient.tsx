"use client";
import { useOrders } from "@/hooks/useOrders";

export default function OrderHistoryPageClient() {
  const { data: orders, isLoading } = useOrders();

  if (isLoading) return <p>Loading your orders...</p>;
  if (!orders?.length) return <p>No orders found.</p>;

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border rounded-lg p-4 bg-white shadow-sm"
          >
            <div className="flex justify-between mb-2">
              <span className="font-semibold">Order #{order.id}</span>
              <span className="text-gray-600 capitalize">{order.status}</span>
            </div>
            <p className="text-sm text-gray-500 mb-2">
              Placed on {new Date(order.created_at).toLocaleDateString()}
            </p>
            <ul className="text-sm">
              {order.items.map((item: any) => (
                <li key={item.id}>
                  {item.quantity} × {item.product_name} — £{item.price}
                </li>
              ))}
            </ul>
            <p className="font-semibold mt-3">Total: £{order.total_price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
