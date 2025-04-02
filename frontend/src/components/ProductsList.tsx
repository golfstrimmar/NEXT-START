"use client";
import React, { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import Pagination from "@/components/Pagination";
import Loading from "@/components/Loading/Loading";
interface Product {
  _id: string;
  name: string;
  price: string;
  imageSrc: string;
  imageAlt: string;
  color?: string;
  createdAt: string;
  __v: number;
}

const ProductsList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const [currentProducts, setCurrentProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products", {
        method: "GET",
      });
      if (!response.ok) throw new Error("Error");
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Что-то пошло не так");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    setCurrentProducts(products?.slice(indexOfFirstItem, indexOfLastItem));
  }, [products, indexOfFirstItem, indexOfLastItem]);

  return (
    <div className="bg-white">
      <div className="mx-auto my-4 max-w-2xl px-4  sm:px-6 sm:py-4 lg:max-w-7xl lg:px-8">
        <h1 className="text-2xl font-bold mb-6">Products</h1>
        {loading && <Loading />}
        {error && <p className="text-red-500 text-center">{error}</p>}
        {!loading && !error && products.length === 0 && (
          <p className="text-center">There are no products</p>
        )}
        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {!loading &&
            !error &&
            currentProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
        </div>
        {products.length > 0 && (
          <Pagination
            items={products}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

export default ProductsList;
