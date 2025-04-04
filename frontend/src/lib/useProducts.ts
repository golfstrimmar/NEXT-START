// lib/useProducts.ts
import { useState, useEffect } from "react";

interface Product {
  _id: string;
  name: string;
  price: number;
  imageSrc: string;
  imageAlt: string;
  color?: string;
}

export const useProducts = (itemsPerPage: number) => {
  const [nameFilter, setNameFilter] = useState<string>("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [inStockFilter, setInStockFilter] = useState<string | null>("all");

  const handleGetProducts = async () => {
    const params = new URLSearchParams({
      name: nameFilter,
      minPrice: priceRange[0].toString(),
      maxPrice: priceRange[1].toString(),
      page: currentPage.toString(),
      limit: itemsPerPage.toString(),
      inStock: inStockFilter?.toString() || "all",
    });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to get products: ${errorData.error || response.statusText}`
        );
      }
      const data = await response.json();
      setProducts(data.products);
      setTotalItems(data.total);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      setTotalItems(0);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleGetProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [nameFilter, priceRange, currentPage, inStockFilter]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    const isMin = e.target.name === "minPrice";
    setPriceRange((prev) => {
      const [min, max] = prev;
      if (isMin) return [value, Math.max(value, max)];
      return [Math.min(min, value), value];
    });
    setCurrentPage(1);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameFilter(e.target.value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setNameFilter("");
    setPriceRange([0, 1000]);
    setInStockFilter("all");
    setCurrentPage(1);
  };

  return {
    products,
    setProducts,
    totalItems,
    setTotalItems,
    nameFilter,
    setNameFilter,
    priceRange,
    setPriceRange,
    inStockFilter,
    setInStockFilter,
    currentPage,
    setCurrentPage,
    handlePriceChange,
    handleNameChange,
    resetFilters,
  };
};
