"use client";
import React from "react";
import ProductCard from "@/components/ProductCard";
import Pagination from "@/components/Pagination";
import Filters from "@/components/Filters";
import { useProducts } from "@/lib/useProducts";

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

interface ProductsListProps {
  initialProducts: Product[];
  initialTotal: number;
}

const ProductsList: React.FC<ProductsListProps> = ({
  initialProducts,
  initialTotal,
}) => {
  const {
    products,
    totalItems,
    nameFilter,
    setNameFilter,
    priceRange,
    setPriceRange,
    inStockFilter,
    setInStockFilter,
    colorFilter,
    setColorFilter,
    currentPage,
    setCurrentPage,
    handlePriceChange,
    handleNameChange,
    resetFilters,
    loading,
    error,
  } = useProducts(4, initialProducts, initialTotal);

  return (
    <div className="">
      <div className="mx-auto my-4 px-4 sm:px-6 sm:py-4  lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
          <div className=" p-4 rounded-lg  bg-white">
            <Filters
              nameFilter={nameFilter}
              setNameFilter={setNameFilter}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              inStockFilter={inStockFilter}
              setInStockFilter={setInStockFilter}
              colorFilter={colorFilter}
              setColorFilter={setColorFilter}
              handlePriceChange={handlePriceChange}
              handleNameChange={handleNameChange}
              resetFilters={resetFilters}
            />
          </div>

          <div>
            {loading ? (
              <div className="text-center mt-6">Loading...</div>
            ) : error ? (
              <p className="text-red-500 text-center mt-6">{error}</p>
            ) : products.length === 0 ? (
              <p className="text-center mt-6">There are no products</p>
            ) : (
              <div className=" grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-x-6 gap-y-10">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {totalItems > 0 && (
              <div className="mt-6">
                <Pagination
                  totalItems={totalItems}
                  itemsPerPage={4}
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
