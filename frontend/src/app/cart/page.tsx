"use client";

import React from "react";
import { useCart } from "@/providers/CartContext";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useCart();

  const subtotal = cart.reduce((sum, item) => {
    const price =
      item.price == null
        ? 0
        : typeof item.price === "string"
        ? parseFloat(item.price.replace(/[^0-9.]/g, ""))
        : item.price;
    return sum + (isNaN(price) ? 0 : price) * item.quantity;
  }, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      {cart.length === 0 ? (
        <p className="text-center text-gray-500">Your cart is empty</p>
      ) : (
        <div className="space-y-8">
          <ul className="space-y-6">
            {cart.map((product) => {
              const price =
                product.price == null
                  ? 0
                  : typeof product.price === "string"
                  ? parseFloat(product.price.replace(/[^0-9.]/g, ""))
                  : product.price;
              const itemTotal = isNaN(price) ? 0 : price * product.quantity;
              const formattedItemTotal = itemTotal.toFixed(2);

              return (
                <li
                  key={product.id}
                  className="flex items-center border-b pb-4"
                >
                  <img
                    src={product.imageSrc}
                    alt={product.imageAlt}
                    className="w-20 h-20 object-cover rounded-md mr-4"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-medium text-gray-900">
                        {product.name}
                      </h2>
                      <p className="text-lg font-medium text-gray-900">
                        ${formattedItemTotal}
                      </p>
                    </div>
                    <div className="flex items-center mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(product.id, product.quantity - 1)
                        }
                        className="px-2 py-1 bg-gray-200 rounded-l-md hover:bg-gray-300"
                      >
                        −
                      </button>
                      <span className="px-4 py-1 bg-gray-100">
                        {product.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(product.id, product.quantity + 1)
                        }
                        className="px-2 py-1 bg-gray-200 rounded-r-md hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-medium text-gray-900">
              <p>Subtotal</p>
              <p>${subtotal.toFixed(2)}</p>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Shipping and taxes calculated at checkout.
            </p>
            <button className="mt-4 w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700">
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
