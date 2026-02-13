"use client";

import { useState } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "react-hot-toast";
import type { Product } from "@/types/product";

const baseUrl = process.env.NEXT_PUBLIC_API_URL_CLIENT;

const Card: React.FC<Product> = ({ id, name, description, price, image }) => {
  const [quantity, setQuantity] = useState(1);
  const [email, setEmail] = useState("");

  const handleConfirm = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/api/preorders/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: id,
          email: email,
          quantity: quantity,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit preorder");

      const data = await res.json();
      toast.success(`Preordered ${data.quantity} of ${name} ✅`);
      setEmail("");
      setQuantity(1);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong with preorder ❌");
    }
  };

  return (
    <div className="bg-white border rounded-lg p-4 flex flex-col hover:shadow-md transition-shadow">
      {/* Image wrapper */}
      <div className="w-full aspect-square flex items-center justify-center overflow-hidden rounded-md bg-gray-100">
        {image && (
          <Image
            width={200}
            height={200}
            src={`${image}`}
            alt={name}
            className="object-contain"
          />
        )}
      </div>

      {/* Content */}
      <div className="mt-3 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900">{name}</h3>
        <p className="text-sm text-gray-500">{description}</p>
        <span className="mt-auto font-medium text-gray-800">£{price}</span>

        {/* Preorder Button triggers Modal */}
        <Dialog.Root>
          <Dialog.Trigger asChild>
            <button
              className="mt-3 w-full rounded-md bg-pink-600 text-white px-3 py-2 text-sm font-medium 
                         shadow-[0_0_10px_#FF007F] transition 
                         hover:bg-pink-700 hover:shadow-[0_0_15px_#00FFE7] 
                         focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              Preorder
            </button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
            <Dialog.Content
              className="fixed top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2
                         bg-white rounded-xl shadow-lg p-6 z-50"
            >
              {/* Product Image */}
              <div className="relative w-full h-48 mb-4 flex justify-center">
                {image && (
                  <Image
                    src={`${image}`}
                    alt={name}
                    width={300}
                    height={300}
                    className="object-contain rounded-lg"
                  />
                )}
              </div>

              <Dialog.Title className="text-lg font-semibold text-gray-900">
                {name}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-gray-600 mt-1">
                {description}
              </Dialog.Description>
              <p className="mt-2 text-pink-600 font-bold">
                {" "}
                Est. Price: £{price}
              </p>

              {/* Quantity selector */}
              <div className="mt-4 flex items-center gap-2">
                <label htmlFor="qty" className="text-sm text-gray-700">
                  Qty:
                </label>
                <input
                  id="qty"
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-20 border rounded-md px-2 py-1 text-center"
                />
              </div>

              {/* Email */}
              <div className="mt-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Enter your email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  You’ll receive an email once we go live for your order.
                </p>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex justify-end gap-3">
                <Dialog.Close asChild>
                  <button className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100 transition">
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700 transition"
                >
                  Confirm Preorder
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  );
};

export default Card;
