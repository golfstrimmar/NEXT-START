"use client";
import React, { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import Pagination from "@/components/Pagination";
import Loading from "./Loading/Loading";
import ProductFilters from "@/components/ProductFilters";

interface Product {
  _id: string;
  name: string;
  price: string;
  imageSrc: string;
  imageAlt: string;
  colors?: string[];
  category?: string;
  subcategory?: string;
  createdAt: string;
  stock: number;
  __v: number;
}

interface ProductsListProps {
  initialProducts: Product[];
  initialTotal: number;
  categories: string[];
  colors: string[];
  category?: string;
  subcategory?: string;
  stocks?: string[];
}

const ProductsList: React.FC<ProductsListProps> = ({
  initialProducts,
  initialTotal,
  categories,
  colors,
  category,
  subcategory,
  stocks,
}) => {
  const [displayProducts, setDisplayProducts] =
    useState<Product[]>(initialProducts);
  const [totalItems, setTotalItems] = useState<number>(initialTotal);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(false);
  const [isFilterUpdating, setIsFilterUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 3;

  // Применение фильтров
  const handleFilterChange = (filteredProducts: Product[], total: number) => {
    setIsFilterUpdating(true);
    setDisplayProducts(filteredProducts);
    setTotalItems(total);
    setIsFilterUpdating(false);
  };

  return (
    <div className="mx-auto my-4 px-4 sm:px-6 sm:py-4 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
        <ProductFilters
          initialProducts={initialProducts}
          initialTotal={initialTotal}
          categories={categories}
          colors={colors}
          stocks={stocks}
          itemsPerPage={itemsPerPage}
          onFilterChange={handleFilterChange}
          setError={setError}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          category={category}
          subcategory={subcategory}
        />
        <div>
          {isInitialLoading ? (
            <Loading />
          ) : error ? (
            <p className="text-red-500 text-center mt-6">{error}</p>
          ) : displayProducts.length === 0 ? (
            <p className="text-center mt-6">No products found</p>
          ) : (
            <div
              className={`grid grid-cols-1 md:grid-cols-[repeat(auto-fill,300px)] gap-x-6 gap-y-10 transition-opacity duration-200 ${
                isFilterUpdating ? "opacity-70" : "opacity-100"
              }`}
            >
              {displayProducts.map((product) => (
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
  );
};

export default ProductsList;
