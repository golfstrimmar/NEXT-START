import { useState, useEffect } from "react";

interface Product {
  _id: string;
  name: string;
  price: string;
  imageSrc: string;
  imageAlt: string;
  color?: string;
  createdAt: string;
  stock: number;
  __v: number;
}

export const useProducts = (
  itemsPerPage: number,
  initialProducts: Product[] = [],
  initialTotal: number = 0
) => {
  const [nameFilter, setNameFilter] = useState<string>("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [totalItems, setTotalItems] = useState<number>(initialTotal);
  const [inStockFilter, setInStockFilter] = useState<string | null>("all");
  const [colorFilter, setColorFilter] = useState<string | null>(null); // Новый фильтр по цвету
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
      ...(colorFilter && { color: colorFilter }), // Добавляем цвет, если он выбран
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
  }, [nameFilter, priceRange, currentPage, inStockFilter, colorFilter]);

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
    setColorFilter(null); // Сбрасываем цвет
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
    setInStockFilter,
    colorFilter, // Возвращаем новый фильтр
    setColorFilter,
    currentPage,
    setCurrentPage,
    handlePriceChange,
    handleNameChange,
    resetFilters,
    loading,
    error,
  };
};
