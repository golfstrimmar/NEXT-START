"use client";
import React, { useState, useEffect, useRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import styles from "./Plaza.module.scss";
import { useStateContext } from "@/components/StateProvider";
import { XMarkIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import TagTree from "@/components/TagTree/TagTree";
import htmlToPug from "@/app/utils/htmlToPug";
import htmlToScss from "@/app/utils/htmlToScss";
const Plaza = () => {
  const { stone, setStone } = useStateContext();
  const [tags, setTags] = useState<string[]>([]);
  const Duplicate = useRef(null);
  const Mark = useRef(null);
  const CopyPug = useRef(null);
  const CopyScss = useRef(null);
  console.log("<====plaza stone====>", stone);
  const selfClosingTags = ["br", "img", "hr"];

  const createTagFromArray = (item: {
    tag: string;
    className?: string;
    subClassName?: string;
    extraClass?: string;
    content?: string;
  }): string => {
    const { tag, className, subClassName, extraClass, content = "" } = item;

    const attributes: Record<string, string> = {};
    if (className) {
      attributes.className = className;
    }
    if (subClassName) {
      attributes.className = className + subClassName;
    }
    if (extraClass) {
      attributes.className = className + subClassName + " " + extraClass;
    }
    const Tag = tag as keyof JSX.IntrinsicElements;

    if (selfClosingTags.includes(tag)) {
      // Самозакрывающиеся теги
      const element = <Tag {...attributes} />;
      return renderToStaticMarkup(element);
    } else {
      // Обычные теги
      const element = <Tag {...attributes}>{content}</Tag>;
      return renderToStaticMarkup(element);
    }
  };

  useEffect(() => {
    if (stone.length > 0) {
      const lastStone = stone[stone.length - 1];
      const generatedTag = createTagFromArray(lastStone);
      setTags((prev) => [...prev, generatedTag]);
      // Не очищаем stone полностью, чтобы сохранить историю, но удаляем последний элемент
      setStone((prev) => prev.slice(0, -1));
    }
  }, [stone, setStone]);

  const handlerCopy = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log("<====tags====>", tags);
    navigator.clipboard.writeText(tags.join(""));
    if (Duplicate.current) {
      Duplicate.current.style.boxShadow = "0 0 10px cyan";
      setTimeout(() => {
        if (Duplicate.current) {
          Duplicate.current.style.boxShadow = "none";
        }
      }, 300);
    }
  };
  const handlerCopyPug = () => {
    const pugOutput = tags.map((tag) => htmlToPug(tag)).join("\n");
    navigator.clipboard.writeText(pugOutput);
    if (CopyPug.current) {
      CopyPug.current.style.boxShadow = "0 0 10px blue";
      setTimeout(() => {
        if (CopyPug.current) {
          CopyPug.current.style.boxShadow = "none";
        }
      }, 300);
    }
  };

  const handlerCopyScss = () => {
    const scssOutput = tags.map((tag) => htmlToScss(tag)).join("\n");
    navigator.clipboard.writeText(scssOutput);
    if (CopyScss.current) {
      CopyScss.current.style.boxShadow = "0 0 10px green";
      setTimeout(() => {
        if (CopyScss.current) {
          CopyScss.current.style.boxShadow = "none";
        }
      }, 300);
    }
  };

  const handlerClear = () => {
    setTags([]);
    setStone([]);
    if (Mark.current) {
      Mark.current.style.boxShadow = "0 0 10px red";
      setTimeout(() => {
        if (Mark.current) {
          Mark.current.style.boxShadow = "none";
        }
      }, 300);
    }
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
    <div className="flex h-screen">
      {/* Дерево тегов */}
      <div className="w-1/2">
        <TagTree tags={tags} />
      </div>
      {/* Основной контент */}

      <div className="flex-1 p-4">
        <div className="plaza">
          <div className="flex gap-2 mb-2">
            <button
              ref={Mark}
              type="button"
              onClick={handlerClear}
              className="w-8 h-8 bg-red-400 rounded-full border border-gray-300 flex items-center justify-center leading-none text-[14px] cursor-pointer hover:bg-red-600 transition-all duration-200 ease-in-out"
            >
              <XMarkIcon className="w-4 h-4 text-white" />
            </button>
            <button
              ref={Duplicate}
              type="button"
              onClick={handlerCopy}
              className="w-8 h-8 bg-cyan-500 rounded-full border border-gray-300 flex items-center justify-center leading-none text-[14px] cursor-pointer hover:bg-cyan-600 transition-all duration-200 ease-in-out overflow-hidden"
            >
              <DocumentDuplicateIcon className="w-4 h-4 text-white" />
            </button>
            <button
              ref={CopyPug}
              type="button"
              onClick={handlerCopyPug}
              className="w-8 h-8 bg-purple-500 rounded-full border border-gray-300 flex items-center justify-center leading-none text-[14px] cursor-pointer hover:bg-purple-600 transition-all duration-200 ease-in-out overflow-hidden"
            >
              <span className="text-white text-xs">Pug</span>
            </button>
            <button
              ref={CopyScss}
              type="button"
              onClick={handlerCopyScss}
              className="w-8 h-8 bg-green-500 rounded-full border border-gray-300 flex items-center justify-center leading-none text-[14px] cursor-pointer hover:bg-green-600 transition-all duration-200 ease-in-out overflow-hidden"
            >
              <span className="text-white text-xs">SCSS</span>
            </button>
          </div>
          <div className="plaza rounded border border-gray-300">
            <div className="rounded border border-gray-300 bg-[#a6beca]">
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
                      onClick={() =>
                        setTags(tags.filter((_, i) => i !== index))
                      }
                      className="w-6 h-6 border border-gray-300 flex items-center justify-center leading-none text-[14px] cursor-pointer bg-yellow-700 transition-all duration-200 ease-in-out"
                    >
                      <XMarkIcon className="w-6 h-6 text-white" />
                    </button>
                    <p>{tag}</p>
                    <div dangerouslySetInnerHTML={{ __html: tag }} />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plaza;
