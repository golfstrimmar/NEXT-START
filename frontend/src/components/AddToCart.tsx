"use client";
import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button/Button";
import { useCart } from "@/providers/CartContext";
import ModalMessage from "@/components/ModalMessage/ModalMessage";
// =================================

// =================================
const AddToCart = ({ product }: { product: any }) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const { cart, setCart } = useCart();
  // ==============================
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
  // ==============================
  // ==============================
  return (
    <div className="mt-2 w-full flex justify-center">
      {error && <ModalMessage message={error} open={showModal} />}
      <Button onClick={handleAddToCart} buttonText="Add to Cart" />
    </div>
  );
};

export default AddToCart;
