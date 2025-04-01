"use client";
import React, { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button/Button";
import { useCart } from "@/providers/CartContext";
import ModalMessage from "@/components/ModalMessage/ModalMessage";

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
  const { cart, setCart } = useCart();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const handleAddToCart = async () => {
    const initialQuantity = 1;
    const currentItem = cart.find((item) => item.id === product._id);
    const currentQuantity = currentItem ? currentItem.quantity : 0;
    const newQuantity = currentQuantity + initialQuantity;

    if (product.stock && newQuantity > product.stock) {
      setError(
        `Cannot add more. Only ${product.stock} items available, you already have ${currentQuantity} in cart`
      );
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        setError("");
      }, 2000);
      return;
    }

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
          stock: product.stock,
          quantity: initialQuantity,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add product to cart");
      }

      const updatedCart = await response.json();
      setCart(updatedCart);
    } catch (error) {
      setError(`"Error adding to cart:", error.message`);
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        setError("");
      }, 2000);
    }
  };

  return (
    <div className="group relative">
      {error && <ModalMessage message={error} open={showModal} />}
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
        <div className="mt-2 w-full">
          <Button onClick={handleAddToCart} buttonText="Add to Cart" />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
