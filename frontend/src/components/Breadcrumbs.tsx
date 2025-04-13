"use client";
import React from "react";
import Link from "next/link";

interface BreadcrumbsProps {
  category?: string;
  subcategory?: string;
  productName?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  category,
  subcategory,
  productName,
}) => {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
  ];

  if (category) {
    crumbs.push({
      label: category.charAt(0).toUpperCase() + category.slice(1), // Woman
      href: `/shop/${encodeURIComponent(category)}`,
    });
  }

  if (subcategory) {
    crumbs.push({
      label: subcategory.charAt(0) + subcategory.slice(1), // Dress
      href: category
        ? `/shop/${encodeURIComponent(category)}/${encodeURIComponent(
            subcategory
          )}`
        : null,
    });
  }

  if (productName) {
    crumbs.push({
      label: productName,
      href: null, // Текущая страница не кликабельна
    });
  }

  return (
    <nav aria-label="breadcrumb" className="my-4 px-4 sm:px-6 lg:px-8">
      <ol className="flex flex-wrap items-center space-x-2 text-sm text-gray-600">
        {crumbs.map((crumb, index) => (
          <li key={crumb.label} className="flex items-center">
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="hover:text-indigo-600 transition-colors duration-200"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium">{crumb.label}</span>
            )}
            {index < crumbs.length - 1 && (
              <span className="mx-2 text-gray-400">/</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
