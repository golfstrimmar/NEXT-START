"use client";
import React from "react";
import ProductCard from "@/components/ProductCard";
import Pagination from "@/components/Pagination";
import Loading from "@/components/Loading/Loading";
import InputRadio from "./ui/InputRadio/InputRadio";
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

const ProductsList: React.FC = () => {
  const {
    products,
    totalItems,
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
  } = useProducts(4); // 4 продукта на страницу

  return (
    <div className="bg-white">
      <div className="mx-auto my-4 max-w-2xl px-4 sm:px-6 sm:py-4 lg:max-w-7xl lg:px-8">
        <h1 className="text-2xl font-bold mb-6">Products</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Filter by name
            </label>
            <input
              type="text"
              placeholder="Enter part of the name"
              value={nameFilter}
              onChange={handleNameChange}
              className="mt-1 px-4 py-2 border rounded-md w-full"
            />
          </div>
          <div>
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
          <InputRadio
            type="radio"
            data="inStock"
            value={inStockFilter || "all"}
            options={["in Stock", "out of Stock", "all"]}
            onChange={(e) => setInStockFilter(e.target.value)}
          />
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Reset Filters
          </button>
        </div>

        {products.length === 0 ? (
          <p className="text-center mt-6">There are no products</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {totalItems > 0 && (
          <Pagination
            totalItems={totalItems}
            itemsPerPage={4}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

export default ProductsList;
