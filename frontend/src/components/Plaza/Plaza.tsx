"use client";
import React, { useState, useEffect } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import styles from "./Plaza.module.scss";
import { useStateContext } from "@/components/StateProvider";
import { XMarkIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";

interface Stone {
  name: string;
  value: string;
}

const Plaza = () => {
  const { stone, setStone } = useStateContext();
  const [tags, setTags] = useState<string[]>([]);

  const createTagFromArray = (items: Stone[]): string => {
    const tagItem = items.find((item) => item.name === "tag");
    const tag = tagItem ? tagItem.value : "div";

    const attributes = items.reduce((acc, item) => {
      if (item.name !== "tag" && item.name !== "content") {
        acc[item.name] = item.value;
      }
      return acc;
    }, {} as Record<string, string>);

    const contentItem = items.find((item) => item.name === "content");
    const content = contentItem ? contentItem.value : "";

    const Tag = tag as keyof JSX.IntrinsicElements;
    const element = <Tag {...attributes}>{content}</Tag>;
    const result = renderToStaticMarkup(element);
    console.log("<====result====>", result);
    return result;
  };

  useEffect(() => {
    if (stone.length > 0) {
      const generatedTag = createTagFromArray(stone);
      setTags((prev) => [...prev, generatedTag]);
      setStone([]); // Очищаем stone после добавления
    }
  }, [stone, setStone]);

  const handlerCopy = () => {
    console.log("<====tags====>", tags);
    navigator.clipboard.writeText(tags.join(""));
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    e.dataTransfer.setData("text/plain", index.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    targetIndex: number
  ) => {
    e.preventDefault();
    const draggedIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);

    if (draggedIndex === targetIndex) return;

    setTags((prev) => {
      const newTags = [...prev];
      const draggedTag = newTags[draggedIndex];
      const targetTag = newTags[targetIndex];

      // Вкладываем перетаскиваемый тег как содержимое целевого
      const updatedTargetTag = targetTag.replace(/>/, `>${draggedTag}`);

      newTags[targetIndex] = updatedTargetTag;
      newTags.splice(draggedIndex, 1);

      return newTags;
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  return (
    <div className="plaza">
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => setTags([])}
          className="w-6 h-6 bg-red-400 rounded-full border border-gray-300 flex items-center justify-center leading-none text-[14px] cursor-pointer hover:bg-red-600 transition-all duration-200 ease-in-out"
        >
          <XMarkIcon className="w-6 h-6 text-white" />
        </button>
        <button
          type="button"
          onClick={handlerCopy}
          className="w-6 h-6 bg-cyan-500 rounded-full border border-gray-300 flex items-center justify-center leading-none text-[14px] cursor-pointer hover:bg-cyan-600 transition-all duration-200 ease-in-out"
        >
          <DocumentDuplicateIcon className="w-6 h-6 text-white" />
        </button>
      </div>
      <div className="plaza rounded border border-gray-300">
        <div className="rounded border border-gray-300 bg-[#B0BEC5]">
          {tags &&
            tags.map((tag, index) => (
              <div
                key={index}
                className="flex items-center gap-2 border border-gray-300"
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                <button
                  type="button"
                  onClick={() => setTags(tags.filter((_, i) => i !== index))}
                  className="w-6 h-6 border border-gray-300 flex items-center justify-center leading-none text-[14px] cursor-pointer bg-yellow-700 transition-all duration-200 ease-in-out"
                >
                  <XMarkIcon className="w-6 h-6 text-white" />
                </button>
                {tag}
                <div dangerouslySetInnerHTML={{ __html: tag }} />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Plaza;
