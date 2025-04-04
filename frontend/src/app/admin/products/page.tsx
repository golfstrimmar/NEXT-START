"use client";
import React, { useState } from "react";
import { useProducts } from "@/lib/useProducts";
import Pagination from "@/components/Pagination";
import ModalProductEdit from "@/components/admin/ModalProductEdit";
import InputRadio from "@/components/ui/InputRadio/InputRadio";
import ModalConfirmDelete from "@/components/admin/ModalConfirmDelete";

interface Product {
  _id: string;
  name: string;
  price: number;
  imageSrc: string;
  imageAlt: string;
  color?: string;
}

const ProductsPage: React.FC = () => {
  const {
    products,
    setProducts,
    totalItems,
    setTotalItems,
    nameFilter,
    setNameFilter,
    priceRange,
    setPriceRange,
    inStockFilter,
    setInStockFilter,
    currentPage,
    setCurrentPage,
    handlePriceChange,
    handleNameChange,
    resetFilters,
  } = useProducts(4);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string | null;
    message: string;
    error: string | null;
  }>({
    isOpen: false,
    id: null,
    message: "",
    error: null,
  });

  const handleEdit = (product: Product) => {
    setEditingProduct({ ...product });
  };

  const handleSaveEdit = async (updatedProduct: Product) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: updatedProduct._id, ...updatedProduct }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to update product: ${errorData.error || response.statusText}`
        );
      }
      setProducts((prev) =>
        prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
      );
      setEditingProduct(null);
    } catch (error) {
      console.error("Error updating product:", error);
      alert((error as Error).message);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteModal({
      isOpen: true,
      id,
      message: "Are you sure you want to delete this product?",
      error: null,
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products?id=${deleteModal.id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to delete product: ${errorData.error || response.statusText}`
        );
      }
      setProducts((prev) => prev.filter((p) => p._id !== deleteModal.id));
      setTotalItems((prev) => prev - 1);
      setDeleteModal({
        isOpen: true,
        id: null,
        message: "Product deleted successfully!",
        error: null,
      });
      setTimeout(() => {
        setDeleteModal({
          isOpen: false,
          id: null,
          message: "",
          error: null,
        });
      }, 1500);
    } catch (error) {
      console.error("Error deleting product:", error);
      setDeleteModal({
        isOpen: true,
        id: null,
        message: "Failed to delete product:",
        error: (error as Error).message,
      });
    }
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, id: null, message: "", error: null });
  };

  return (
    <div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Filter by name
          </label>
          <input
            type="text"
            placeholder="Enter part of the name"
            value={nameFilter}
            onChange={handleNameChange}
            className="mt-1 px-4 py-2 border rounded-md w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price Range: ${priceRange[0]} - ${priceRange[1]}
          </label>
          <div className="flex space-x-4 mt-1">
            <input
              type="range"
              name="minPrice"
              min="0"
              max="1000"
              value={priceRange[0]}
              onChange={handlePriceChange}
              className="w-full"
            />
            <input
              type="range"
              name="maxPrice"
              min="0"
              max="1000"
              value={priceRange[1]}
              onChange={handlePriceChange}
              className="w-full"
            />
          </div>
        </div>
        <InputRadio
          type="radio"
          data="inStock"
          value={inStockFilter || "all"}
          options={["in Stock", "out of Stock", "all"]}
          onChange={(e) => setInStockFilter(e.target.value)}
        />
        <button
          onClick={resetFilters}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Reset Filters
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow mt-6">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price ($)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Color
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <img
                      src={product.imageSrc}
                      alt={product.imageAlt}
                      className="w-12 h-12 object-cover rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.color || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-indigo-600 hover:text-indigo-800 mr-4 cursor-pointer transition-all duration-300 ease-in-out"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="text-red-600 hover:text-red-800 cursor-pointer transition-all duration-300 ease-in-out"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingProduct && (
        <ModalProductEdit
          product={editingProduct}
          onSave={handleSaveEdit}
          onCancel={() => setEditingProduct(null)}
        />
      )}

      <ModalConfirmDelete
        isOpen={deleteModal.isOpen}
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
        message={deleteModal.message}
        error={deleteModal.error}
      />

      {totalItems > 0 && (
        <Pagination
          totalItems={totalItems}
          itemsPerPage={4}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
};

export default ProductsPage;
