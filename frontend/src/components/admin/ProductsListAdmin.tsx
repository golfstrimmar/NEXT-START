"use client";
import React, { useState } from "react";
import Pagination from "@/components/Pagination";
import ModalProductEdit from "@/components/admin/ModalProductEdit";
import ModalConfirmDelete from "@/components/admin/ModalConfirmDelete";
import ProductFilters from "@/components/ProductFilters";
import Loading from "@/components/Loading/Loading";
interface Product {
  _id: string;
  name: string;
  price: string;
  imageSrc: string;
  imageAlt: string;
  color?: string;
  category?: string;
  createdAt: string;
  stock: number;
  __v: number;
}

interface ProductsListProps {
  initialProducts: Product[];
  initialTotal: number;
  categories: string[];
  colors: string[];
  category?: string;
  subcategory?: string;
  stocks?: string[];
}

const ProductsListAdmin: React.FC<ProductsListProps> = ({
  initialProducts,
  initialTotal,
  categories,
  colors,
  stocks,
  category,
  subcategory,
}) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [totalItems, setTotalItems] = useState<number>(initialTotal);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 3;

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

  const handleFilterChange = (filteredProducts: Product[], total: number) => {
    setProducts(filteredProducts);
    setTotalItems(total);
  };

  const handleEdit = (product: Product) => setEditingProduct({ ...product });

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
      alert(error instanceof Error ? error.message : "Something went wrong");
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
        { method: "DELETE" }
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
        setDeleteModal({ isOpen: false, id: null, message: "", error: null });
      }, 1500);
    } catch (error) {
      console.error("Error deleting product:", error);
      setDeleteModal({
        isOpen: true,
        id: null,
        message: "Failed to delete product:",
        error: error instanceof Error ? error.message : "Something went wrong",
      });
    }
  };

  const closeDeleteModal = () =>
    setDeleteModal({ isOpen: false, id: null, message: "", error: null });

  return (
    <div className="bg-white min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">Manage Products</h1>
      <div className="p-4 rounded-lg bg-gray-50 mb-6">
        <ProductFilters
          initialProducts={initialProducts}
          initialTotal={initialTotal}
          categories={categories}
          colors={colors}
          itemsPerPage={itemsPerPage}
          onFilterChange={handleFilterChange}
          setLoading={setLoading}
          setError={setError}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          stocks={stocks}
          category={category}
          subcategory={subcategory}
        />
      </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        {loading ? (
          <Loading />
        ) : error ? (
          <p className="text-red-500 text-center py-4">{error}</p>
        ) : products.length === 0 ? (
          <p className="text-center py-4">No products found</p>
        ) : (
          <>
            {/* Таблица для десктопа */}
            <div className="hidden min-[1201px]:block">
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
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subcategory
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Color
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <img
                          src={
                            product.colors?.find(
                              (color) => color.images?.length > 0
                            )?.images[0] ||
                            product.imageSrc ||
                            "/placeholder-image.jpg"
                          }
                          alt={product.imageAlt || product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap  text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap  text-gray-900">
                        {product.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap  text-gray-900">
                        {product.category || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap  text-gray-900">
                        {product.subcategory || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap  text-gray-900">
                        {product.color || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap  text-gray-900">
                        {product.stock !== undefined ? product.stock : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap ">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-indigo-600 hover:text-indigo-800 mr-4 cursor-pointer transition-all duration-300 ease-in-out px-2 py-1"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 hover:text-red-800 cursor-pointer transition-all duration-300 ease-in-out px-2 py-1"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Карточки для мобильных устройств */}
            <div className="min-[1201px]:hidden space-y-4 p-4 max-w-2xl mx-auto">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="border border-gray-200 rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={
                        product.colors?.find(
                          (color) => color.images?.length > 0
                        )?.images[0] ||
                        product.imageSrc ||
                        "/placeholder-image.jpg"
                      }
                      alt={product.imageAlt || product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <h3 className=" font-medium text-gray-900">
                        {product.name}
                      </h3>
                      <p className=" text-gray-600">${product.price}</p>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className=" font-medium text-gray-700">
                      Category:
                    </span>
                    <span className=" text-gray-900">
                      {product.category || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className=" font-medium text-gray-700">
                      Subcategory:
                    </span>
                    <span className=" text-gray-900">
                      {product.subcategory || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className=" font-medium text-gray-700">Color:</span>
                    <span className=" text-gray-900">
                      {product.color || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className=" font-medium text-gray-700">Stock:</span>
                    <span className=" text-gray-900">
                      {product.stock !== undefined ? product.stock : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-end space-x-4 pt-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-indigo-600 hover:text-indigo-800  font-medium cursor-pointer transition-all duration-300 ease-in-out px-2 py-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="text-red-600 hover:text-red-800  font-medium cursor-pointer transition-all duration-300 ease-in-out px-2 py-1"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
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
        <div className="mt-6">
          <Pagination
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default ProductsListAdmin;
