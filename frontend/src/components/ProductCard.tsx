"use client";
import React from "react";
import Link from "next/link";
interface ProductProps {
  _id: string;
  name: string;
  imageSrc: string;
  imageAlt: string;
  price: string;
  color?: string;
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
      <div className="mt-4 ">
        <div className="flex justify-between">
          <h3 className="text-sm text-gray-700">{product.name}</h3>
          <p className="text-sm font-medium text-gray-900">{product.price}</p>
        </div>

        {product.color && (
          <p className="mt-1 text-sm text-gray-500">{product.color}</p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
