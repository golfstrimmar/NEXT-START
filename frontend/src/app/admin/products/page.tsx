import React from "react";
import ProductsListAdmin from "@/components/admin/ProductsListAdmin";

interface Product {
  _id: string;
  name: string;
  price: string;
  imageSrc: string;
  imageAlt: string;
  color?: string;
  category?: string;
  createdAt: string;
  stock: number;
  __v: number;
}

interface FiltersResponse {
  categories: string[];
  colors: string[];
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

const ProductsPage: React.FC = async () => {
  const initialData = await getInitialProducts();
  const filtersData: FiltersResponse = await getFilters();

  const initialProducts: Product[] = initialData.products;
  const initialTotal: number = initialData.total;

  return (
    <ProductsListAdmin
      initialProducts={initialProducts}
      initialTotal={initialTotal}
      categories={filtersData.categories}
      colors={filtersData.colors}
      stocks={filtersData.stocks}
      category={filtersData.category}
      subcategory={filtersData.subcategory}
    />
  );
};

export default ProductsPage;
