"use client";
import React, { useState, useMemo } from "react";

interface Product {
  id: string;
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

  // Фильтрация продуктов на клиенте
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      const nameMatch = product.name
        .toLowerCase()
        .includes(nameFilter.toLowerCase());
      const priceNum = parseInt(product.price.replace("$", "")); // Предполагаем формат "$50"
      const priceMatch = priceNum >= priceRange[0] && priceNum <= priceRange[1];
      return nameMatch && priceMatch;
    });
  }, [initialProducts, nameFilter, priceRange]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    const isMin = e.target.name === "minPrice";

    setPriceRange((prev) => {
      const [min, max] = prev;
      if (isMin) {
        // Если новая минимальная цена больше текущей максимальной, увеличиваем максимальную
        return [value, Math.max(value, max)];
      } else {
        // Если новая максимальная цена меньше текущей минимальной, уменьшаем минимальную
        return [Math.min(min, value), value];
      }
    });
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
      {/* Фильтры */}
      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Filter by name
          </label>
          <input
            type="text"
            placeholder="Enter part of the name"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
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

      {/* Таблица */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProducts.map((product) => (
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductList;
