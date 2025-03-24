"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
interface Product {
  _id: string;
  name: string;
  price: string;
  imageSrc: string;
  imageAlt: string;
  color?: string;
}

interface ModalProductEditProps {
  product: Product; // Продукт для редактирования
  onSave: (updatedProduct: Product) => void; // Callback для сохранения
  onCancel: () => void; // Callback для закрытия
}

const ModalProductEdit: React.FC<ModalProductEditProps> = ({
  product,
  onSave,
  onCancel,
}) => {
  const [editedProduct, setEditedProduct] = useState<Product>({ ...product });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProduct((prev) => ({
      ...prev,
      [name]: value || (name === "color" ? undefined : value),
    }));
  };

  const handleSubmit = () => {
    onSave(editedProduct);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-lg font-bold mb-4">Edit Product</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={editedProduct.name}
                onChange={handleChange}
                className="mt-1 px-4 py-2 border rounded-md w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Price
              </label>
              <input
                type="text"
                name="price"
                value={editedProduct.price}
                onChange={handleChange}
                className="mt-1 px-4 py-2 border rounded-md w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Color
              </label>
              <input
                type="text"
                name="color"
                value={editedProduct.color || ""}
                onChange={handleChange}
                placeholder="Enter color (optional)"
                className="mt-1 px-4 py-2 border rounded-md w-full"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md"
            >
              Save
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModalProductEdit;
