import React, { useState, useEffect } from "react";

import ProductsList from "@/components/ProductsList";
// import { Suspense } from "react";
// import Loading from "@/components/Loading/Loading";
// <Suspense fallback={<Loading />}></Suspense>;
// =================================

// =================================
const Products: React.FC = () => {
  return (
    <div className="Products">
      <div className=" mx-auto max-w-7xl my-4">
        <h2 className="text-2xl md:text-4xl font-bold text-gray-900 text-center relative z-10">
          All Products
        </h2>

        <ProductsList />
      </div>
    </div>
  );
};

export default Products;
