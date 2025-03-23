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

const fetchProducts = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products`,
      {
        cache: "no-store",
      }
    );
    if (!response.ok) throw new Error("Error");
    const data = await response.json();
    return data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

export default async function ProductsPage() {
  const products = await fetchProducts();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Products</h1>
      <ProductList products={products} />
    </div>
  );
}
