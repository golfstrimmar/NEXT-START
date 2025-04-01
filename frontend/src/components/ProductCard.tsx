"use client";
import React, { useState } from "react";
import Link from "next/link";
import AddToCart from "./AddToCart";

interface ProductProps {
  _id: string;
  name: string;
  imageSrc: string;
  imageAlt: string;
  price: string;
  color?: string;
  stock?: number;
}

const ProductCard: React.FC<{ product: ProductProps }> = ({ product }) => {
  return (
    <div className="group relative">
      <Link href={`/products/${product._id}`} className="cursor-pointer block">
        <img
          alt={product.imageAlt}
          src={product.imageSrc}
          className="aspect-square w-full rounded-md bg-gray-200 object-cover group-hover:transform group-hover:scale-105 transition duration-300 ease-in-out lg:aspect-auto lg:h-80 cursor-pointer"
        />
      </Link>
      <div className="mt-4">
        <h3 className="text-sm text-gray-700">Name: {product.name}</h3>
        <p className="mt-1 text-sm text-gray-500">Price: {product.price}</p>
        {product.color && (
          <p className="mt-1 text-sm text-gray-500">Color: {product.color}</p>
        )}
        {product.stock && (
          <p className="mt-1 text-sm text-gray-500">Stock: {product.stock}</p>
        )}
        <AddToCart product={product} />
      </div>
    </div>
  );
};

export default ProductCard;
