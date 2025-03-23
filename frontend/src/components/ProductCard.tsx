"use client";
import React from "react";

interface ProductProps {
  _id: string; // Приводим к string для совместимости с MongoDB
  name: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  price: string; // Меняем на string, так как "$48" — строка
  color?: string; // Делаем опциональным, так как не все товары имеют color
}

const ProductCard: React.FC<{ product: ProductProps }> = ({ product }) => {
  return (
    <div className="group relative">
      <img
        alt={product.imageAlt}
        src={product.imageSrc}
        className="aspect-square w-full rounded-md bg-gray-200 object-cover group-hover:transform group-hover:scale-105 transition duration-300 ease-in-out lg:aspect-auto lg:h-80"
      />
      <div className="mt-4 flex justify-between">
        <div>
          <h3 className="text-sm text-gray-700">
            <a href={product.href}>
              <span aria-hidden="true" className="absolute inset-0" />
              {product.name}
            </a>
          </h3>
          {product.color && (
            <p className="mt-1 text-sm text-gray-500">{product.color}</p>
          )}
        </div>
        <p className="text-sm font-medium text-gray-900">{product.price}</p>
      </div>
    </div>
  );
};

export default ProductCard;
