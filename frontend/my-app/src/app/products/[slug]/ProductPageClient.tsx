"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/store/useCart";
import { useProductBySlug } from "@/hooks/useProductsBySlug";
import { ProductVariant } from "@/types/product";
import Breadcrumbs from "@/components/BreadCrumb";

import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";
import ProductBuyBox from "./ProductBuyBox";
import ProductSpecs from "./ProductSpecs";
import FrequentlyBoughtTogether from "./frequentlyBoughtTogether";

type Props = { slug: string };

export default function ProductPageClient({ slug }: Props) {
  const { data: product, isLoading, isError } = useProductBySlug(slug);
  const addItem = useCart((s) => s.addItem);

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );

  const variants = useMemo(() => product?.variants ?? [], [product?.variants]);

  useEffect(() => {
    if (!selectedVariant && variants.length > 0) {
      const firstAvailable = variants.find((v) => v.stock > 0) || variants[0];
      setSelectedVariant(firstAvailable);
    }
  }, [variants, selectedVariant]);

  if (isLoading) return <p>Loading product...</p>;
  if (isError || !product) return <p>Product not found.</p>;

  const price =
    typeof product.price === "string"
      ? parseFloat(product.price)
      : product.price;

  const handleAddToCart = () => {
    if (selectedVariant && selectedVariant.stock === 0) return;

    addItem({
      type: "product",
      id: product.id,
      title: product.name,
      price,
      quantity,
      image: product.image,
      colour: selectedVariant?.colour ?? null,
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
      <div className="md:col-span-12">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
            { label: product.name },
          ]}
        />
      </div>

      <ProductGallery product={product} />

      <ProductInfo
        product={product}
        variants={variants}
        selectedVariant={selectedVariant}
        setSelectedVariant={setSelectedVariant}
      />

      <ProductBuyBox
        product={product}
        quantity={quantity}
        setQuantity={setQuantity}
        selectedVariant={selectedVariant}
        handleAddToCart={handleAddToCart}
      />

      <ProductSpecs product={product} />

      <FrequentlyBoughtTogether product={product} />
    </div>
  );
}
