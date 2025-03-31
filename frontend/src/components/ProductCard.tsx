"use client";
import React from "react";
import Link from "next/link";
import Button from "@/components/ui/Button/Button";
import { useCart } from "@/providers/CartContext";
interface ProductProps {
  _id: string;
  name: string;
  imageSrc: string;
  imageAlt: string;
  price: string;
  color?: string;
}

const ProductCard: React.FC<{ product: ProductProps }> = ({ product }) => {
  const { cart, setCart } = useCart(); // Достаём корзину и функцию для её изменения

  const handleAddToCart = async () => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: product._id,
          name: product.name,
          price: product.price,
          imageSrc: product.imageSrc,
          imageAlt: product.imageAlt,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add product to cart");
      }
      const updatedCart = await response.json();
      setCart(updatedCart);
      console.log("Cart updated:", updatedCart);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

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
        <div className="flex justify-between">
          <h3 className="text-sm text-gray-700">{product.name}</h3>
          <p className="text-sm font-medium text-gray-900">{product.price}</p>
        </div>
        {product.color && (
          <p className="mt-1 text-sm text-gray-500">{product.color}</p>
        )}
        {/* <button
          onClick={handleAddToCart}
          className="mt-2 w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
        >
          Add to Cart
        </button> */}
        <div className="mt-2 w-full">
          <Button onClick={handleAddToCart} buttonText="Add to Cart" />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
