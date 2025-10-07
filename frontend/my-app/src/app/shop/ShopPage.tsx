"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import { useCart } from "@/store/useCart"; // Zustand store
import { cartItem } from "@/types/cart";
import { useProducts } from "@/hooks/useProduct"; // React Query hook
import type { Product } from "@/types/product";
import { getImageUrl } from "@/library/getImageUrl";
import Link from "next/link";

export default function ShopPage() {
  // ✅ Zustand cart state
  const { addItem, isInCart } = useCart();

  // ✅ React Query fetch
  const { data: products = [], isLoading, isError } = useProducts();

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [availability, setAvailability] = useState<string>("all");

  // Extract categories dynamically
  const categories: string[] = ["all", "sticks", "buttons"];

  // Apply filters
  const filteredProducts = products.filter((p: Product) => {
    const inCategory =
      selectedCategory === "all" ? true : p.category === selectedCategory;

    const inPriceRange = p.price >= priceRange[0] && p.price <= priceRange[1];

    const matchesAvailability =
      availability === "all"
        ? true
        : availability === "available"
          ? p.stock >= 1
          : p.stock === 0;

    return inCategory && inPriceRange && matchesAvailability;
  });

  // Convert product to cartItem for Zustand
  const handleAddToCart = (product: Product) => {
    const item: cartItem = {
      id: product.id,
      title: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    };
    addItem(item);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Filters */}
      <aside className="w-64 bg-white shadow-md p-6 hidden md:block">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>

        {/* Category */}
        <div className="mb-6">
          <h3 className="text-md font-semibold mb-2">Category</h3>
          <ul className="space-y-2">
            {categories.map((cat: string) => (
              <li key={cat}>
                <button
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-md transition ${
                    selectedCategory === cat
                      ? "bg-pink-600 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <h3 className="text-md font-semibold mb-2">Price Range</h3>
          <input
            type="range"
            min={0}
            max={100}
            step={10}
            value={priceRange[1]}
            onChange={(e) =>
              setPriceRange([priceRange[0], Number(e.target.value)])
            }
            className="w-full bg-pink-600"
          />
          <p className="mt-2 text-sm">
            Up to <span className="font-bold">£{priceRange[1]}</span>
          </p>
        </div>

        {/* Availability */}
        <div className="mb-6">
          <h3 className="text-md font-semibold mb-2">Availability</h3>
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="w-full border rounded-md p-2 text-gray-700"
          >
            <option value="all">All</option>
            <option value="available">In Stock</option>
            <option value="unavailable">Out of Stock</option>
          </select>
        </div>
      </aside>

      {/* Products Grid */}
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6">Shop</h1>

        {isLoading && <p>Loading products...</p>}
        {isError && <p className="text-red-500">Error loading products</p>}

        {!isLoading && !isError && (
          <>
            {filteredProducts.length === 0 ? (
              <p>No products found.</p>
            ) : (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product: Product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white shadow-md rounded-xl overflow-hidden hover:shadow-lg transition flex flex-col"
                  >
                    {/* 👇 Entire card is wrapped in Link */}
                    <Link
                      href={`/products/${product.slug}`}
                      className="flex flex-col flex-1"
                    >
                      <div className="relative w-full h-48">
                        <Image
                          src={getImageUrl(product.image)}
                          alt={product.name}
                          width={200}
                          height={200}
                          className="object-contain mx-auto"
                        />
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="text-lg font-semibold">
                          {product.name}
                        </h3>
                        <p className="text-[#E01D42] font-bold">
                          £{product.price}
                        </p>
                        <p
                          className={`text-sm ${
                            product.stock >= 1
                              ? "text-green-600"
                              : "text-red-500"
                          }`}
                        >
                          {product.stock >= 1 ? "In Stock" : "Out of Stock"}
                        </p>
                      </div>
                    </Link>

                    {/* ✅ Keep the Add to Cart outside the link to avoid accidental clicks */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className={`mt-auto w-full py-2 px-4 rounded-lg font-semibold transition ${
                        product.stock >= 1
                          ? "bg-[#14485A] text-white hover:bg-[#0e2f3d]"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {isInCart(product.id) ? "Add More" : "Add to Basket"}
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
