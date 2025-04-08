"use client";
import React from "react";
import InputRadio from "./ui/InputRadio/InputRadio";
import Input from "./ui/Input/Input";
import Button from "./ui/Button/Button";

interface FiltersProps {
  nameFilter: string;
  setNameFilter: (value: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  inStockFilter: string | null;
  setInStockFilter: (value: string) => void;
  colorFilter: string | null;
  categoryFilter: string | null;
  setColorFilter: (value: string | null) => void;
  setCategoryFilter: (value: string | null) => void;
  handlePriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resetFilters: () => void;
}

const colors = [
  { name: "Red", value: "red", hex: "#ef4444" },
  { name: "Blue", value: "blue", hex: "#3b82f6" },
  { name: "Green", value: "green", hex: "#22c55e" },
  { name: "Yellow", value: "yellow", hex: "#eab308" },
  { name: "Black", value: "black", hex: "#000000" },
  { name: "White", value: "white", hex: "#ffffff" },
];

const Filters: React.FC<FiltersProps> = ({
  nameFilter,
  setNameFilter,
  priceRange,
  setPriceRange,
  inStockFilter,
  setInStockFilter,
  colorFilter,
  categoryFilter,
  setColorFilter,
  setCategoryFilter,
  handlePriceChange,
  handleNameChange,
  resetFilters,
}) => {
  return (
    <div className="space-y-4">
      <div className="shadow-[0_0_12px_0_rgba(0,0,0,0.1)] rounded-[5px] p-1">
        <label className="block text-sm font-medium text-gray-700">
          Filter by name
        </label>
        <Input
          typeInput="text"
          data="Enter part of the name"
          value={nameFilter}
          onChange={handleNameChange}
        />
      </div>
      <div className="shadow-[0_0_12px_0_rgba(0,0,0,0.1)] rounded-[5px] py-2  px-1">
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
      <div className="shadow-[0_0_12px_0_rgba(0,0,0,0.1)] rounded-[5px] py-2  px-1">
        <label className="block text-sm font-medium text-gray-700">
          Filter by category
        </label>

        <InputRadio
          type="radio"
          data="category"
          value={categoryFilter || "all"}
          options={["home", "electronics", "all"]}
          onChange={(e) => setCategoryFilter(e.target.value)}
        />
      </div>
      <div className="shadow-[0_0_12px_0_rgba(0,0,0,0.1)] rounded-[5px] py-2  px-1">
        <label className="block text-sm font-medium text-gray-700">
          Filter by color
        </label>
        <div className="flex flex-wrap gap-2 mt-1">
          {colors.map((color) => (
            <div
              key={color.value}
              onClick={() =>
                setColorFilter(colorFilter === color.value ? null : color.value)
              }
              className={`w-6 h-6 rounded-full cursor-pointer border-2 ${
                colorFilter === color.value
                  ? "border-gray-900"
                  : "border-gray-300"
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>
      </div>
      <div className="shadow-[0_0_12px_0_rgba(0,0,0,0.1)] rounded-[5px] py-2  px-1">
        <label className="block text-sm font-medium text-gray-700">
          Filter by Stock
        </label>
        <InputRadio
          type="radio"
          data="inStock"
          value={inStockFilter || "all"}
          options={["in Stock", "out of Stock", "all"]}
          onChange={(e) => setInStockFilter(e.target.value)}
        />{" "}
      </div>
      <Button buttonText="Reset Filters" onClick={resetFilters} />
    </div>
  );
};

export default Filters;
