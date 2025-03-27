"use client";
import React, { useState, useMemo, useEffect } from "react";
import Pagination from "@/components/Pagination";
import ModalProductEdit from "@/components/admin/ModalProductEdit";
interface Product {
  _id: string;
  name: string;
  price: string;
  imageSrc: string;
  imageAlt: string;
  color?: string;
}

interface ProductListProps {
  initialProducts: Product[];
}

const ProductList: React.FC<ProductListProps> = ({ initialProducts }) => {
  const [nameFilter, setNameFilter] = useState<string>("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const itemsPerPage = 2;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const nameMatch = product.name
        .toLowerCase()
        .includes(nameFilter.toLowerCase());
      const priceNum = parseInt(product.price.replace("$", ""));
      const priceMatch = priceNum >= priceRange[0] && priceNum <= priceRange[1];
      return nameMatch && priceMatch;
    });
  }, [products, nameFilter, priceRange]);

  const currentProducts = useMemo(() => {
    return filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredProducts, indexOfFirstItem, indexOfLastItem]);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    const isMin = e.target.name === "minPrice";
    setPriceRange((prev) => {
      const [min, max] = prev;
      if (isMin) return [value, Math.max(value, max)];
      return [Math.min(min, value), value];
    });
    setCurrentPage(1);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameFilter(e.target.value);
    setCurrentPage(1);
  };

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
      setEditingProduct(null); // Закрываем модалку
    } catch (error) {
      console.error("Error updating product:", error);
      alert(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products?id=${id}`,
          {
            method: "DELETE",
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Failed to delete product: ${
              errorData.error || response.statusText
            }`
          );
        }
        setProducts((prev) => prev.filter((p) => p._id !== id));
      } catch (error) {
        console.error("Error deleting product:", error);
        alert(error.message);
      }
    }
  };

  if (
    filteredProducts.length === 0 &&
    !nameFilter &&
    priceRange[0] === 0 &&
    priceRange[1] === 1000
  ) {
    return <p className="text-gray-500">No products found.</p>;
  }

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
                Price
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
            {currentProducts.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <img
                    src={product.imageSrc}
                    alt={product.imageAlt}
                    className="w-12 h-12 object-cover rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{product.price}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.color || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-indigo-600 hover:text-indigo-800 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
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

      {filteredProducts.length > 0 && (
        <Pagination
          items={filteredProducts}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
};

export default ProductList;
