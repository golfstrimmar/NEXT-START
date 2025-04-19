"use client";
import React, { useState, useEffect, useRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import styles from "./Plaza.module.scss";
import { useStateContext } from "@/components/StateProvider";
import ModalMessage from "@/components/ModalMessage/ModalMessage";
import Image from "next/image";
import {
  XMarkIcon,
  DocumentDuplicateIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/outline";
import TagTree from "@/components/TagTree/TagTree";
import htmlToPug from "@/app/utils/htmlToPug";
import htmlToScss from "@/app/utils/htmlToScss";
import LocalSnipets from "@/components/LocalSnipets/LocalSnipets";
const Plaza = () => {
  const {
    stone,
    setStone,
    handlerLastTags,
    lastTags,
    handlerSetTags,
    providerTags,
  } = useStateContext();
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    { index: number; message: string }[]
  >([]);
  const Duplicate = useRef(null);
  const Mark = useRef(null);
  const CopyPug = useRef(null);
  const CopyScss = useRef(null);
  const [storedSnipets, setStoredSnipets] = useState([]);
  const [snipets, setSnipets] = useState("");
  const [snipOpen, setSnipOpen] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const selfClosingTags = [
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
    "svg",
    "path",
    "rect",
    "circle",
    "line",
    "polyline",
    "polygon",
    "use",
  ];

  const inlineElements = ["span", "a", "b", "i", "strong", "em"];
  const blockElements = [
    "div",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "section",
    "article",
  ];

  useEffect(() => {
    if (providerTags.length > 0) {
      console.log("<====providerTags====>", providerTags);
      setTags(providerTags);
    }
  }, [providerTags]);

  const createTagFromArray = (item: {
    tag: string;
    className?: string;
    subClassName?: string;
    extraClass?: string;
    content?: string;
  }): string => {
    const { tag, className, subClassName, extraClass, content = "" } = item;

    const attributes: Record<string, string> = {};
    const classNames = [className, subClassName, extraClass].filter(Boolean);
    const regex = /__/g;

    if (classNames.length > 0) {
      const processedClasses = classNames.map((foo: string) => {
        if (regex.test(foo)) {
          return foo;
        } else {
          return " " + foo;
        }
      });

      attributes.class = processedClasses.join("");
    }

    const tagLower = tag?.toLowerCase().trim();
    if (tagLower === "a") {
      attributes.href = attributes.href || "#";
    }
    if (tagLower === "img") {
      attributes.src = attributes.src || "";
      attributes.alt = attributes.alt || "";
    }
    if (tagLower === "button") {
      attributes.type = attributes.type || "button";
    }

    if (tagLower === "img") {
      const attrList: string[] = [];
      if (attributes.class) {
        attrList.push(`class="${attributes.class}"`);
      }
      attrList.push('src=""');
      attrList.push('alt=""');
      const attrString = attrList.join("");
      const result = `<img ${attrString}/>`;
      return result;
    }

    const attrList: string[] = [];
    for (const [key, value] of Object.entries(attributes)) {
      if (!attrList.some((attr) => attr.startsWith(`${key}=`))) {
        attrList.push(value !== "" ? `${key}="${value}"` : key);
      }
    }
    const attrString = attrList.join("");

    if (selfClosingTags.includes(tagLower)) {
      const result = `<${tagLower}${attrString ? ` ${attrString}` : " "}>`;
      return result;
    } else {
      const result = `<${tagLower}${
        attrString ? ` ${attrString}` : " "
      }>${content}</${tagLower}>`;

      return result;
    }
  };

  useEffect(() => {
    if (lastTags.length > 0) {
      console.log("<====lastTags====>", lastTags);
    }
  }, [lastTags]);
  const moveReturn = () => {
    if (lastTags.length > 0) {
      setTags(lastTags);
    }
  };
  useEffect(() => {
    if (stone.length > 0) {
      const lastStone = stone[stone.length - 1];
      const generatedTag = createTagFromArray(lastStone);
      handlerLastTags(tags);
      setTags((prev) => [...prev, generatedTag]);
      setStone((prev) => prev.slice(0, -1));
    }
  }, [stone, setStone, handlerLastTags, tags]);

  useEffect(() => {
    console.log("<====tags====>", tags);
    const errors = tags
      .map((tag, index) => {
        const { errors } = htmlToScss(tag);
        return errors.map((error) => ({
          index,
          message: error.message,
        }));
      })
      .flat();
    setValidationErrors(errors);
  }, [tags]);

  const handleSelectTag = (index: number) => {
    setSelectedTags((prevSelected) => {
      const isSelected = prevSelected.includes(index);
      const updatedSelected = isSelected
        ? prevSelected.filter((i) => i !== index)
        : [...prevSelected, index];

      // const updatedSnippets = updatedSelected.map((i) => tags[i]);
      // setSnipets(updatedSnippets);

      return updatedSelected;
    });
  };

  const handleClick = (event: MouseEvent) => {
    if (event.altKey) {
      setSnipets((prev) => {
        const newSnipets = [...prev, event?.target?.innerText || ""];
        return newSnipets;
      });
    } else {
      console.log("<====Обычный клик====>");
    }
  };

  const moveUp = () => {
    if (selectedTags.length === 0 || selectedTags.some((i) => i === 0)) return;

    const newTags = [...tags];
    const newSelected: number[] = [];

    selectedTags
      .sort((a, b) => a - b)
      .forEach((index) => {
        [newTags[index - 1], newTags[index]] = [
          newTags[index],
          newTags[index - 1],
        ];
        newSelected.push(index - 1);
      });

    setTags(newTags);
    setSelectedTags(newSelected);
  };

  const moveDown = () => {
    if (
      selectedTags.length === 0 ||
      selectedTags.some((i) => i === tags.length - 1)
    )
      return;

    const newTags = [...tags];
    const newSelected: number[] = [];

    selectedTags
      .sort((a, b) => b - a)
      .forEach((index) => {
        [newTags[index + 1], newTags[index]] = [
          newTags[index],
          newTags[index + 1],
        ];
        newSelected.push(index + 1);
      });

    setTags(newTags);
    setSelectedTags(newSelected);
  };

  const getTagName = (tag: string): string => {
    const match = tag.match(/^<([a-z0-9]+)/i);
    return match ? match[1].toLowerCase() : "";
  };

  const handlerCopy = (e: React.MouseEvent<HTMLButtonElement>) => {
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
    if (validationErrors.length > 0) {
      alert(
        "Невозможно конвертировать в SCSS из-за ошибок в HTML:\n" +
          validationErrors.map((err) => `- ${err.message}`).join("\n")
      );
      return;
    }
    const scssOutput = tags.map((tag) => htmlToScss(tag).scss).join("\n");
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
    setSelectedTags([]);
    setValidationErrors([]);
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

    const newTags = [...tags];
    const draggedTag = newTags[draggedIndex];
    const targetTag = newTags[targetIndex];

    const draggedTagName = getTagName(draggedTag);
    const targetTagName = getTagName(targetTag);

    let errorMessage = "";
    if (/^h[1-6]$/.test(targetTagName) && /^h[1-6]$/.test(draggedTagName)) {
      errorMessage = `Недопустимая вложенность: <${draggedTagName}> не может быть внутри <${targetTagName}>`;
    }
    if (selfClosingTags.includes(targetTagName)) {
      errorMessage = `Недопустимая вложенность: <${targetTagName}> не может содержать <${draggedTagName}>`;
    }
    if (
      inlineElements.includes(targetTagName) &&
      blockElements.includes(draggedTagName)
    ) {
      errorMessage = `Недопустимая вложенность: строчный <${targetTagName}> не может содержать блочный <${draggedTagName}>`;
    }
    if (draggedTagName === "li" && !["ul", "ol"].includes(targetTagName)) {
      errorMessage = `Недопустимая вложенность: <li> должен быть внутри <ul> или <ol>, а не <${targetTagName}>`;
    }
    if (/^h[1-6]$/.test(targetTagName) && draggedTagName === "li") {
      errorMessage = `Недопустимая вложенность: <${draggedTagName}> не может быть внутри заголовка <${targetTagName}>`;
    }
    if (
      targetTagName === "p" &&
      (draggedTagName === "p" || blockElements.includes(draggedTagName))
    ) {
      errorMessage = `Недопустимая вложенность: <p> не может содержать <${draggedTagName}>`;
    }
    const interactiveElements = ["a", "button", "input", "select", "textarea"];
    if (targetTagName === "a" && interactiveElements.includes(draggedTagName)) {
      errorMessage = `Недопустимая вложенность: <a> не может содержать <${draggedTagName}>`;
    }
    if (
      targetTagName === "button" &&
      interactiveElements.includes(draggedTagName)
    ) {
      errorMessage = `Недопустимая вложенность: <button> не может содержать <${draggedTagName}>`;
    }
    if (["dt", "dd"].includes(draggedTagName) && targetTagName !== "dl") {
      errorMessage = `Недопустимая вложенность: <${draggedTagName}> должен быть внутри <dl>, а не <${targetTagName}>`;
    }
    if (draggedTagName === "figcaption" && targetTagName !== "figure") {
      errorMessage = `Недопустимая вложенность: <figcaption> должен быть внутри <figure>, а не <${targetTagName}>`;
    }
    if (["td", "th"].includes(draggedTagName) && targetTagName !== "tr") {
      errorMessage = `Недопустимая вложенность: <${draggedTagName}> должен быть внутри <tr>, а не <${targetTagName}>`;
    }
    if (
      draggedTagName === "tr" &&
      !["table", "tbody", "thead", "tfoot"].includes(targetTagName)
    ) {
      errorMessage = `Недопустимая вложенность: <tr> должен быть внутри <table>, <tbody>, <thead> или <tfoot>, а не <${targetTagName}>`;
    }

    if (errorMessage) {
      setError(errorMessage);
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        setError("");
      }, 1500);
      return;
    }

    const updatedTargetTag = targetTag.replace(/>/, `>${draggedTag}`);
    newTags[targetIndex] = updatedTargetTag;
    newTags.splice(draggedIndex, 1);

    setTags((prev) => {
      handlerLastTags(prev);
      return newTags;
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  return (
    <div className="flex">
      {error && <ModalMessage message={error} open={showModal} />}

      <div className="max-w-1/4 p-4">
        <LocalSnipets
          snipets={snipets}
          setSnipets={setSnipets}
          storedSnipets={storedSnipets}
          setStoredSnipets={setStoredSnipets}
          setSelectedTags={setSelectedTags}
          selectedTags={selectedTags}
          setTags={setTags}
          snipOpen={snipOpen}
          setSnipOpen={setSnipOpen}
        />
      </div>
      {/* <div className="w-1/2">
        <TagTree tags={tags} />
      </div> */}
      <div className="flex-1 p-4">
        <div className="plaza">
          <div className="flex gap-2 mb-2">
            <button
              ref={Mark}
              type="button"
              onClick={() => setSnipOpen((prev) => !prev)}
              className="w-8 h-8 bg-slate-500 rounded-full border border-gray-300 flex items-center justify-center leading-none text-[14px] cursor-pointer hover:bg-slate-600 transition-all duration-200 ease-in-out text-white"
            >
              S
            </button>
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
              <Image
                src="https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original-wordmark.svg"
                alt="pug"
                width={30}
                height={30}
                className="p-1"
              />
            </button>
            <button
              ref={CopyPug}
              type="button"
              onClick={handlerCopyPug}
              className="w-8 h-8 bg-purple-500 rounded-full border border-gray-300 flex items-center justify-center leading-none text-[14px] cursor-pointer hover:bg-purple-600 transition-all duration-200 ease-in-out overflow-hidden"
            >
              <Image src="/pug.svg" alt="pug" width={30} height={30} />
            </button>
            <button
              ref={CopyScss}
              type="button"
              onClick={handlerCopyScss}
              className="w-8 h-8 bg-green-500 rounded-full border border-gray-300 flex items-center justify-center leading-none text-[14px] cursor-pointer hover:bg-green-600 transition-all duration-200 ease-in-out overflow-hidden"
            >
              <Image
                src="https://raw.githubusercontent.com/devicons/devicon/master/icons/sass/sass-original.svg"
                alt="sass"
                width={25}
                height={25}
              />
            </button>
            <button
              type="button"
              onClick={moveUp}
              disabled={
                selectedTags.length === 0 || selectedTags.some((i) => i === 0)
              }
              className="w-8 h-8 bg-blue-500 rounded-full border border-gray-300 flex items-center justify-center leading-none text-[14px] cursor-pointer hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out"
            >
              <ArrowUpIcon className="w-4 h-4 text-white" />
            </button>
            <button
              type="button"
              onClick={moveDown}
              disabled={
                selectedTags.length === 0 ||
                selectedTags.some((i) => i === tags.length - 1)
              }
              className="w-8 h-8 bg-blue-500 rounded-full border border-gray-300 flex items-center justify-center leading-none text-[14px] cursor-pointer hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out"
            >
              <ArrowDownIcon className="w-4 h-4 text-white" />
            </button>
            <button
              type="button"
              onClick={moveReturn}
              disabled={tags.length === 0}
              className="w-8 h-8 bg-slate-400 rounded-full border border-gray-300 flex items-center justify-center leading-none text-[14px] cursor-pointer hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out"
            >
              <ArrowUturnLeftIcon className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="plaza rounded border border-zinc-300">
            <div className="rounded border border-gray-300 bg-transparent">
              {tags.map((tag, index) => {
                const hasError = validationErrors.some(
                  (err) => err.index === index
                );
                const isSelected = selectedTags.includes(index);
                return (
                  <div
                    key={index}
                    className={`grid items-center grid-cols-[1fr_20px]  border border-zinc-800 ${
                      hasError ? "border-red-500 bg-red-100" : ""
                    } ${isSelected ? styles.selected : ""}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    onClick={(event) => {
                      handleSelectTag(index);
                      handleClick(event);
                    }}
                    title={
                      hasError
                        ? validationErrors
                            .filter((err) => err.index === index)
                            .map((err) => err.message)
                            .join("\n")
                        : ""
                    }
                  >
                    {/* <p>{tag}</p> */}
                    <TagTree tags={[tag]} />
                    {/* <div dangerouslySetInnerHTML={{ __html: tag }} /> */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTags(tags.filter((_, i) => i !== index));
                        setSelectedTags(
                          selectedTags.filter((i) => i !== index)
                        );
                      }}
                      className="max-w-6 h-6 border border-zinc-300 flex items-center justify-center leading-none text-[14px] cursor-pointer bg-yellow-700 transition-all duration-200 ease-in-out"
                    >
                      <XMarkIcon className="max-w-6 h-6 text-white" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plaza;
