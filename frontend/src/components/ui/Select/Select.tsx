"use client";

import { useState } from "react";
import Image from "next/image";

interface SelectProps {
  selectItems: string[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  name?: string;
  className?: string;
}

export default function Select({
  selectItems,
  value,
  onChange,
  name = "category",
  className = "w-full",
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (item: string) => {
    // Создаём синтетическое событие, совместимое с handleChange
    const syntheticEvent = {
      target: { name, value: item },
    } as React.ChangeEvent<HTMLSelectElement>;
    onChange(syntheticEvent);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className="p-2 border border-gray-300 rounded bg-white cursor-pointer flex justify-between items-center transition-all duration-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value || "Select a category"}</span>
        <Image
          src="/assets/svg/chevron-down.svg"
          alt="chevron-down"
          width={15}
          height={15}
          className={`transform transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>
      <ul
        className={`absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-auto transition-all duration-300 ease-in-out ${
          isOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        {selectItems.map((item) => (
          <li
            key={item}
            className={`p-2 cursor-pointer hover:bg-blue-100 ${
              value === item ? "bg-blue-50 font-semibold" : ""
            }`}
            onClick={() => handleSelect(item)}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
