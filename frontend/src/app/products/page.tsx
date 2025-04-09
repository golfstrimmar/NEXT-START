import React from "react";
import ProductsList from "@/components/ProductsList";

interface Product {
  _id: string;
  name: string;
  price: string;
  imageSrc: string;
  imageAlt: string;
  category?: string;
  color?: string;
  createdAt: string;
  stock: number;
  __v: number;
}

async function getInitialProducts() {
  const params = new URLSearchParams({
    page: "1",
    limit: "40000",
    inStock: "all",
  });
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/products?${params.toString()}`,
    { cache: "no-store" }
  );
  if (!response.ok) throw new Error("Failed to fetch initial products");
  return response.json();
}

async function getFilters() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/filters`,
    {
      cache: "no-store",
    }
  );
  if (!response.ok) throw new Error("Failed to fetch filters");
  return response.json();
}

const Products: React.FC = async () => {
  const initialData = await getInitialProducts();
  const filtersData = await getFilters();

  const initialProducts: Product[] = initialData.products;
  const totalItems: number = initialData.total;
  const categories: string[] = filtersData.categories;
  const colors: string[] = filtersData.colors;

  return (
    <div>
      <div className="mx-auto max-w-[1600px] my-4">
        <h2 className="text-2xl md:text-4xl font-bold text-gray-900 text-center relative z-10">
          Products
        </h2>
        <ProductsList
          initialProducts={initialProducts}
          initialTotal={totalItems}
          categories={categories}
          colors={colors}
        />
      </div>
    </div>
  );
};

export default Products;
