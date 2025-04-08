"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

interface Product {
  _id: string;
  name: string;
  price: number;
  imageSrc: string;
  imageAlt: string;
  color?: string;
  category?: string;
  stock?: number;
  createdAt?: string;
  __v?: number;
}

export const useProducts = (
  itemsPerPage: number,
  initialProducts: Product[] = [],
  initialTotal: number = 0
) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [nameFilter, setNameFilter] = useState<string>(
    searchParams.get("name") || ""
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([
    parseInt(searchParams.get("minPrice") || "0"),
    parseInt(searchParams.get("maxPrice") || "1000"),
  ]);
  const [currentPage, setCurrentPage] = useState<number>(
    parseInt(searchParams.get("page") || "1")
  );
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [totalItems, setTotalItems] = useState<number>(initialTotal);
  const [inStockFilter, setInStockFilter] = useState<string | null>(
    searchParams.get("inStock") || "all"
  );
  const [colorFilter, setColorFilter] = useState<string | null>(
    searchParams.get("color") || null
  );
  const [categoryFilter, setCategoryFilter] = useState<string | null>(
    searchParams.get("category") || null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ======================================
  // ======================================
  // ======================================

  const handleGetProducts = async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      name: nameFilter,
      minPrice: priceRange[0].toString(),
      maxPrice: priceRange[1].toString(),
      page: currentPage.toString(),
      limit: itemsPerPage.toString(),
      inStock: inStockFilter?.toString() || "all",
      ...(colorFilter && { color: colorFilter }),
      ...(categoryFilter && { category: categoryFilter }),
    });

    console.log("Fetching products with params:", params.toString());

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
      console.log("Received data:", {
        products: data.products.length,
        total: data.total,
      });
      setProducts(data.products);
      setTotalItems(data.total);

      const maxPages = Math.ceil(data.total / itemsPerPage);
      console.log(
        "Calculated maxPages:",
        maxPages,
        "currentPage:",
        currentPage
      );
      if (currentPage > maxPages && maxPages > 0) {
        setCurrentPage(maxPages);
      } else if (data.total === 0) {
        setCurrentPage(1);
      }

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error instanceof Error ? error.message : "Something went wrong");
      setProducts([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleGetProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [
    nameFilter,
    priceRange,
    inStockFilter,
    colorFilter,
    categoryFilter,
    currentPage,
  ]);

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

  const handleInStockChange = (value: string) => {
    setInStockFilter(value);
    setCurrentPage(1);
  };

  const handleColorChange = (value: string | null) => {
    setColorFilter(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string | null) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setNameFilter("");
    setPriceRange([0, 1000]);
    setInStockFilter("all");
    setColorFilter(null);
    setCategoryFilter(null);
    setCurrentPage(1);
    handleGetProducts();
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
    setInStockFilter: handleInStockChange,
    colorFilter,
    setColorFilter: handleColorChange,
    categoryFilter,
    setCategoryFilter: handleCategoryChange,
    currentPage,
    setCurrentPage,
    handlePriceChange,
    handleNameChange,
    resetFilters,
    loading,
    error,
  };
};
