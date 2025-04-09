"use client";
import React, { useState, useEffect, useRef } from "react";
import ProductCard from "@/components/ProductCard";
import Pagination from "@/components/Pagination";
import Loading from "./Loading/Loading";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import InputRadio from "@/components/ui/InputRadio/InputRadio";
// ===============================
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
}
const ProductFilters: React.FC<ProductsListProps> = ({
  initialProducts,
  initialTotal,
  categories,
  colors,
}) => {};

export default ProductFilters;
