"use client";
import React, { useState } from "react";
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

const ProductsList: React.FC<ProductsListProps> = ({
  initialProducts,
  initialTotal,
  categories,
  colors,
}) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [totalItems, setTotalItems] = useState<number>(initialTotal);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 3;

  const handleFilterChange = (filteredProducts: Product[], total: number) => {
    setProducts(filteredProducts);
    setTotalItems(total);
  };

  return (
    <div className="mx-auto my-4 px-4 sm:px-6 sm:py-4 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
        <ProductFilters
          initialProducts={initialProducts}
          initialTotal={initialTotal}
          categories={categories}
          colors={colors}
          itemsPerPage={itemsPerPage}
          onFilterChange={handleFilterChange}
          setLoading={setLoading}
          setError={setError}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
        <div>
          {loading ? (
            <Loading />
          ) : error ? (
            <p className="text-red-500 text-center mt-6">{error}</p>
          ) : products.length === 0 ? (
            <p className="text-center mt-6">No products found</p>
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
  );
};

export default ProductsList;
