"use client";
import React, { useState, useEffect, useRef } from "react";
import ProductCard from "@/components/ProductCard";
import Pagination from "@/components/Pagination";
import Loading from "./Loading/Loading";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import InputRadio from "@/components/ui/InputRadio/InputRadio";

// Интерфейсы
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

interface ProductsListProps {
  initialProducts: Product[];
  initialTotal: number;
  categories: string[];
  colors: string[];
}

interface ApiResponse {
  products: Product[];
  total: number;
  error?: string;
}

const ProductsList: React.FC<ProductsListProps> = ({
  initialProducts,
  initialTotal,
  categories,
  colors,
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(initialTotal);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemsPerPage: number = 3;

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
    searchParams.get("category") || null
  );

  // Server Action для фильтрации
  const handleGetProducts = async (): Promise<void> => {
    setLoading(true);
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
    });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products?${params.toString()}`,
        { method: "GET", cache: "no-store" as RequestCache }
      );
      if (!response.ok) {
        const errorData: ApiResponse = await response.json();
        throw new Error(
          `Failed to get products: ${errorData.error || response.statusText}`
        );
      }
      const data: ApiResponse = await response.json();
      setProducts(data.products);
      setTotalItems(data.total);

      const maxPages = Math.ceil(data.total / itemsPerPage);
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
      if (inputRef.current && document.activeElement === inputRef.current) {
        const cursorPosition = inputRef.current.selectionStart;
        if (cursorPosition !== null) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
        }
      }
    }
  };

  // Обработчики изменений
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setNameFilter(e.target.value);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = parseInt(e.target.value, 10);
    const isMin = e.target.name === "minPrice";
    setPriceRange((prev) => {
      const [min, max] = prev;
      if (isMin) return [value, Math.max(value, max)];
      return [Math.min(min, value), value];
    });
  };

  const resetFilters = (): void => {
    setNameFilter("");
    setPriceRange([0, 1000]);
    setInStockFilter("all");
    setColorFilter(null);
    setCategoryFilter(null);
    setCurrentPage(1);
    handleGetProducts();
  };

  // Вызов при изменении фильтров
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

  return (
    <div className="">
      <div className="mx-auto my-4 px-4 sm:px-6 sm:py-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
          <div className="rounded-lg bg-white space-y-4">
            <div>
              <Input
                ref={inputRef}
                typeInput="text"
                data="Search by name..."
                name="name"
                value={nameFilter}
                onChange={handleNameChange}
              />
            </div>
            <div className="shadow-[0_0_12px_0_rgba(0,0,0,0.1)] rounded-[5px] py-2 px-1 mt-2">
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
            <div className="shadow-[0_0_12px_0_rgba(0,0,0,0.1)] rounded-[5px] py-2 px-1">
              <label className="block text-sm font-medium text-gray-700">
                Filter by category
              </label>
              <InputRadio
                type="radio"
                data="category"
                value={categoryFilter || "all"}
                options={[...categories, "all"]}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCategoryFilter(
                    e.target.value === "all" ? null : e.target.value
                  )
                }
              />
            </div>
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
                      colorFilter === color
                        ? "border-gray-900"
                        : "border-gray-300"
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
                options={["in Stock", "out of Stock", "all"]}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setInStockFilter(e.target.value)
                }
              />
            </div>
            <div className="mt-4">
              <Button buttonText="Reset Filters" onClick={resetFilters} />
            </div>
          </div>

          <div>
            {loading ? (
              <Loading />
            ) : error ? (
              <p className="text-red-500 text-center mt-6">{error}</p>
            ) : products.length === 0 ? (
              <p className="text-center mt-6">There are no products</p>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-x-6 gap-y-10">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
            {totalItems > 0 && (
              <div className="mt-6">
                <Pagination
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsList;
