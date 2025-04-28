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
    const syntheticEvent = {
      target: { name, value: item },
    } as React.ChangeEvent<HTMLSelectElement>;
    onChange(syntheticEvent);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`select-custom p-2 border border-gray-300 rounded bg-white cursor-pointer flex justify-between items-center transition-all duration-300 ${
          isOpen ? "run" : ""
        }`}
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
      <div
        className={`z-10 w-full mt-1 bg-white  max-h-60 overflow-auto transition-all duration-300  ease-in-out next-hidden`}
      >
        <div className={`next-hidden__wrap select-list  `}>
          <ul className="">
            {selectItems.map((item, index) => (
              <li
                key={index}
                className={`p-2 cursor-pointer hover:bg-blue-100 ${
                  value === item ? "bg-blue-50 font-semibold" : ""
                }`}
                onClick={() => handleSelect(item.value)}
              >
                {item.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
