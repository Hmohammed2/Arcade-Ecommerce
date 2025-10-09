"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { useCart } from "@/store/useCart";
import { cartItem } from "@/types/cart";
import { useProducts } from "@/hooks/useProduct";
import type { Product } from "@/types/product";
import { getImageUrl } from "@/library/getImageUrl";

export default function ShopPage() {
  const { addItem, isInCart } = useCart();
  const { data: products = [], isLoading, isError } = useProducts();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [availability, setAvailability] = useState<string>("all");

  const categories = [
    "all",
    ...Array.from(new Set(products.map((p) => p.category?.name))).filter(
      Boolean
    ),
  ];

  const filteredProducts = products.filter((product: Product) => {
    const inCategory =
      selectedCategory === "all" || product.category?.name === selectedCategory;
    const inPriceRange =
      product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesAvailability =
      availability === "all" ||
      (availability === "available" && product.stock > 0) ||
      (availability === "unavailable" && product.stock === 0);
    return inCategory && inPriceRange && matchesAvailability;
  });

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Filters */}
      <aside className="w-64 bg-white shadow-md p-6 hidden md:block">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
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
            className="w-full accent-pink-600"
          />
          <p className="mt-2 text-sm">
            Up to <span className="font-bold">£{priceRange[1]}</span>
          </p>
        </div>

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
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    addItem={addItem}
                    isInCart={isInCart}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function ProductCard({
  product,
  addItem,
  isInCart,
}: {
  product: Product;
  addItem: (item: cartItem) => void;
  isInCart: (id: number, colour?: string) => boolean;
}) {
  const colours =
    Array.isArray(product.colours) && product.colours.length > 0
      ? product.colours.map((c: any) => (typeof c === "string" ? c : c.name))
      : [];

  const [selectedColour, setSelectedColour] = useState<string>(
    colours[0] || ""
  );

  const handleAddToCart = () => {
    const item: cartItem = {
      id: product.id,
      title: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      colour: selectedColour || null,
    };
    addItem(item);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white shadow-md rounded-xl overflow-hidden hover:shadow-lg transition flex flex-col"
    >
      <Link href={`/products/${product.slug}`} className="flex flex-col flex-1">
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
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <p className="text-[#E01D42] font-bold">£{product.price}</p>
          <p
            className={`text-sm ${
              product.stock > 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            {product.stock > 0 ? "In Stock" : "Out of Stock"}
          </p>

          {colours.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {colours.map((colour) => (
                <button
                  key={colour}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedColour(colour);
                  }}
                  className={`px-2 py-1 text-xs rounded-md border transition ${
                    selectedColour === colour
                      ? "bg-[#14485A] text-white border-[#14485A]"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {colour}
                </button>
              ))}
            </div>
          )}
        </div>
      </Link>

      <button
        onClick={handleAddToCart}
        disabled={product.stock === 0}
        className={`mt-auto w-full py-2 px-4 rounded-lg font-semibold transition ${
          product.stock > 0
            ? "bg-[#14485A] text-white hover:bg-[#0e2f3d]"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        {isInCart(product.id, selectedColour) ? "Add More" : "Add to Basket"}
      </button>
    </motion.div>
  );
}
