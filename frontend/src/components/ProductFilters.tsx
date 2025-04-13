"use client";
import React, { useState, useEffect, useRef } from "react";
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import InputRadio from "@/components/ui/InputRadio/InputRadio";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

interface Product {
  _id: string;
  name: string;
  price: string;
  imageSrc: string;
  imageAlt: string;
  color?: string;
  category?: string;
  subcategory?: string;
  createdAt: string;
  stock: number;

  __v: number;
}

interface ApiResponse {
  products: Product[];
  total: number;
  error?: string;
}

interface ProductFiltersProps {
  initialProducts: Product[];
  initialTotal: number;
  categories: string[];
  colors: string[];
  stocks: string[];
  itemsPerPage: number;
  onFilterChange: (products: Product[], total: number) => void;
  // setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  category?: string;
  subcategory?: string;
  disableAutoRequests?: boolean;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  initialProducts,
  initialTotal,
  categories,
  colors,
  stocks,
  itemsPerPage,
  onFilterChange,
  // setLoading,
  setError,
  currentPage,
  setCurrentPage,
  category,
  subcategory,
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);

  // Фильтры
  const [nameFilter, setNameFilter] = useState<string>(
    searchParams.get("name") || ""
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([
    parseInt(searchParams.get("minPrice") || "0", 10),
    parseInt(searchParams.get("maxPrice") || "1000", 10),
  ]);
  const [inStockFilter, setInStockFilter] = useState<string>(
    searchParams.get("inStock") || "all"
  );
  const [colorFilter, setColorFilter] = useState<string | null>(
    searchParams.get("color") || null
  );
  const [categoryFilter, setCategoryFilter] = useState<string | null>(
    category?.toString()
      ? category.toString()
      : searchParams.get("category") || null
  );
  const [subCategoryFilter, setSubCategoryFilter] = useState<string | null>(
    subcategory?.toString() || searchParams.get("subcategory") || null
  );

  // Логика получения продуктов
  const handleGetProducts = async () => {
    // setLoading(true);
    setError("");
    const params = new URLSearchParams({
      name: nameFilter,
      minPrice: priceRange[0].toString(),
      maxPrice: priceRange[1].toString(),
      page: currentPage.toString(),
      limit: itemsPerPage.toString(),
      inStock: inStockFilter,
      ...(colorFilter && { color: colorFilter }),
      ...(categoryFilter && { category: categoryFilter }),
      ...(subCategoryFilter && { subcategory: subCategoryFilter }),
    });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products?${params.toString()}`,
        { method: "GET", cache: "no-store" }
      );
      if (!response.ok) {
        const errorData: ApiResponse = await response.json();
        throw new Error(
          `Failed to get products: ${errorData.error || response.statusText}`
        );
      }
      const data: ApiResponse = await response.json();
      onFilterChange(data.products, data.total);

      const maxPages = Math.ceil(data.total / itemsPerPage);
      if (currentPage > maxPages && maxPages > 0) setCurrentPage(maxPages);
      else if (data.total === 0) setCurrentPage(1);

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error instanceof Error ? error.message : "Something went wrong");
      onFilterChange([], 0);
    }
    // finally {
    //   setLoading(false);
    // }
  };

  // Сброс фильтров
  const resetFilters = () => {
    setNameFilter("");
    setPriceRange([0, 1000]);
    setInStockFilter("all");
    setColorFilter(null);
    setCategoryFilter(null);
    setsubCategoryFilter(null);
    setCurrentPage(1);
    handleGetProducts();
  };

  useEffect(() => {
    const timer = setTimeout(() => handleGetProducts(), 300);
    return () => clearTimeout(timer);
  }, [
    nameFilter,
    priceRange,
    inStockFilter,
    colorFilter,
    categoryFilter,
    subCategoryFilter,
    currentPage,
    category,
  ]);

  // UI фильтров
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    const isMin = e.target.name === "minPrice";
    setPriceRange((prev) =>
      isMin
        ? [value, Math.max(value, prev[1])]
        : [Math.min(prev[0], value), value]
    );
  };

  return (
    <div className="rounded-lg bg-white space-y-4 p-4">
      <Input
        ref={inputRef}
        typeInput="text"
        data="Search by name..."
        name="name"
        value={nameFilter}
        onChange={(e) => setNameFilter(e.target.value)}
      />
      <div className="shadow-[0_0_12px_0_rgba(0,0,0,0.1)] rounded-[5px] py-2 px-1">
        <label className="block text-sm font-medium text-gray-700">
          Price Range: ${priceRange[0]} - ${priceRange[1]}
        </label>
        <div className="flex space-x-4 mt-1">
          <input
            type="range"
            name="minPrice"
            min="0"
            max="1000"
            value={priceRange[0]}
            onChange={handlePriceChange}
            className="w-full"
          />
          <input
            type="range"
            name="maxPrice"
            min="0"
            max="1000"
            value={priceRange[1]}
            onChange={handlePriceChange}
            className="w-full"
          />
        </div>
      </div>
      {!category?.toString() && (
        <div className="shadow-[0_0_12px_0_rgba(0,0,0,0.1)] rounded-[5px] py-2 px-1">
          <label className="block text-sm font-medium text-gray-700">
            Filter by category
          </label>
          <InputRadio
            type="radio"
            data="category"
            value={categoryFilter || "all"}
            options={[...categories, "all"]}
            onChange={(e) =>
              setCategoryFilter(
                e.target.value === "all" ? null : e.target.value
              )
            }
          />
        </div>
      )}
      <div className="shadow-[0_0_12px_0_rgba(0,0,0,0.1)] rounded-[5px] py-2 px-1">
        <label className="block text-sm font-medium text-gray-700">
          Filter by color
        </label>
        <div className="flex flex-wrap gap-2 mt-1">
          {colors.map((color) => (
            <div
              key={color}
              onClick={() =>
                setColorFilter(colorFilter === color ? null : color)
              }
              className={`w-6 h-6 rounded-full cursor-pointer border-2 ${
                colorFilter === color ? "border-gray-900" : "border-gray-300"
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>
      <div className="shadow-[0_0_12px_0_rgba(0,0,0,0.1)] rounded-[5px] py-2 px-1">
        <label className="block text-sm font-medium text-gray-700">
          Filter by Stock
        </label>
        <InputRadio
          type="radio"
          data="inStock"
          value={inStockFilter}
          options={[...stocks, "all"]}
          onChange={(e) => setInStockFilter(e.target.value)}
        />
      </div>
      <Button buttonText="Reset Filters" onClick={resetFilters} />
    </div>
  );
};

export default ProductFilters;
