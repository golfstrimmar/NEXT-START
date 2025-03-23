import React from "react";
import ProductList from "@/components/admin/ProductList";

interface Product {
  id: string;
  name: string;
  price: string;
  imageSrc: string;
  imageAlt: string;
  color?: string;
}

const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products`,
      {
        cache: "no-store",
      }
    );
    if (!response.ok) throw new Error("Failed to fetch products");
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching products:", err);
    return [];
  }
};

export default async function ProductsPage() {
  const products = await fetchProducts();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Products</h1>
      <ProductList initialProducts={products} />
    </div>
  );
}
