"use client";
import React from "react";
import { useRouter } from "next/navigation";

const Sidebar: React.FC = () => {
  const router = useRouter();

  return (
    <div className="  w-64 bg-gray-800 text-white flex flex-col ">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">Admin Panel</h2>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <button
          onClick={() => router.push("/admin")}
          className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          Dashboard
        </button>
        <button
          onClick={() => router.push("/admin/products")}
          className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          Products
        </button>
        <button
          onClick={() => router.push("/admin/add-product")}
          className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          Add Product
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;
