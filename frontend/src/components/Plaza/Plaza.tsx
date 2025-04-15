"use client";
import React, { useState, useEffect } from "react";
import styles from "./Plaza.module.scss";
import { useStateContext } from "@/components/StateProvider";
import { renderToStaticMarkup } from "react-dom/server";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
interface Stone {
  name: string;
  value: string;
}

const Plaza = () => {
  const { stone, setStone } = useStateContext();
  const [tags, setTags] = useState<string[]>([]);

  const createTagFromArray = (items: Stone[]) => {
    const tagItem = items.find((item) => item.name === "tag");
    const tag = tagItem ? tagItem.value : "div";

    // Собираем атрибуты
    const attributes = items.reduce((acc, item) => {
      if (item.name !== "tag") {
        acc[item.name] = item.value;
      }
      return acc;
    }, {} as Record<string, string>);

    // Создаем JSX-элемент
    const Tag = tag as keyof JSX.IntrinsicElements;
    const element = <Tag {...attributes} />;

    // Преобразуем в строку
    const result = renderToStaticMarkup(element);
    console.log("<====result====>", result);

    return result;
  };

  useEffect(() => {
    if (stone.length > 0) {
      const generatedTag = createTagFromArray(stone);
      console.log("<====tag====>", generatedTag);
      setTags((prev) => [...prev, generatedTag]);
    }
  }, [stone]);

  const handlerCopy = () => {
    console.log("<====tags====>", tags);
    navigator.clipboard.writeText(tags.join(""));
  };

  return (
    <div className="plaza">
      <div className="flex gap-2 mb-2 ">
        <button
          type="button"
          onClick={() => setTags([])}
          className="w-6 h-6 bg-red-400 rounded-full border border-gray-300 flex items-center justify-center leading-none text-[14px] cursor-pointer hover:bg-red-600  transition-all duration-200 ease-in-out"
        >
          <XMarkIcon className="w-6 h-6  text-white"></XMarkIcon>
        </button>
        <button
          type="button"
          onClick={() => handlerCopy()}
          className="w-6 h-6 bg-cyan-500 rounded-full border border-gray-300 flex items-center justify-center leading-none text-[14px] cursor-pointer hover:bg-cyan-600  transition-all duration-200 ease-in-out"
        >
          <DocumentDuplicateIcon className="w-6 h-6  text-white"></DocumentDuplicateIcon>
        </button>
      </div>
      <div className="plaza rounded border border-gray-300 ">
        <div className=" rounded border border-gray-300 bg-[#B0BEC5]">
          {tags &&
            tags.map((tag, index) => (
              <div
                key={index}
                className="flex items-center gap-2 border border-gray-300 "
              >
                <button
                  type="button"
                  onMouseEnter={() =>
                    setTags(tags.filter((_, i) => i !== index))
                  }
                  className="w-6 h-6  border border-gray-300 flex items-center justify-center leading-none text-[14px] cursor-pointer bg-yellow-700  transition-all duration-200 ease-in-out"
                >
                  <XMarkIcon></XMarkIcon>
                </button>
                {tag}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Plaza;
