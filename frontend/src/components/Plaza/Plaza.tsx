"use client";
import React, { useState, useEffect, useRef } from "react";
import styles from "./Plaza.module.scss";
import { useStateContext } from "@/components/StateProvider";
import ModalMessage from "@/components/ModalMessage/ModalMessage";
import Image from "next/image";
import {
  XMarkIcon,
  DocumentDuplicateIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";
import htmlToPug from "@/app/utils/htmlToPug";
import htmlToScss from "@/app/utils/htmlToScss";
import LocalSnipets from "@/components/LocalSnipets/LocalSnipets";

interface Stone {
  id: number;
  content: string;
  level: number;
  parentId: number | null;
}

const Plaza = () => {
  const { stone, setStone } = useStateContext();
  const [selectedStones, setSelectedStones] = useState<number[]>([]);
  const [storedSnipets, setStoredSnipets] = useState([]);
  const [snipets, setSnipets] = useState("");
  const [snipOpen, setSnipOpen] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [stones, setStones] = useState<Stone[]>([]);
  const Duplicate = useRef(null);
  const Mark = useRef(null);
  const CopyPug = useRef(null);
  const CopyScss = useRef(null);
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
    // "svg",
    // "path",
    // "rect",
    // "circle",
    // "line",
    // "polyline",
    // "polygon",
    // "use",
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
      const attrString = attrList.join(" ");
      return `<img ${attrString}/>`;
    }

    const attrList: string[] = [];
    for (const [key, value] of Object.entries(attributes)) {
      if (!attrList.some((attr) => attr.startsWith(`${key}=`))) {
        attrList.push(value !== "" ? `${key}="${value}"` + " " : key + " ");
      }
    }
    const attrString = attrList.join("");

    if (selfClosingTags.includes(tagLower)) {
      return `<${tagLower}${attrString ? ` ${attrString}` : " "}>`;
    } else {
      return `<${tagLower}${
        attrString ? ` ${attrString}` : " "
      }>${content}</${tagLower}>`;
    }
  };

  useEffect(() => {
    if (stone.length > 0) {
      const lastStone = stone[stone.length - 1];
      const generatedTag = createTagFromArray(lastStone);
      setStones((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content: generatedTag,
          level: 0,
          parentId: null,
        },
      ]);
      setStone((prev) => prev.slice(0, -1));
    }
  }, [stone, setStone]);

  const handleSelectStone = (index: number) => {
    setSelectedStones((prevSelected) => {
      const isSelected = prevSelected.includes(index);
      const updatedSelected = isSelected
        ? prevSelected.filter((i) => i !== index)
        : [...prevSelected, index];
      return updatedSelected;
    });
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.altKey) {
      setSnipets((prev) => {
        const newSnipets = [
          ...(Array.isArray(prev) ? prev : [prev]),
          (event.target as HTMLElement)?.innerText || "",
        ];
        return newSnipets;
      });
    } else {
      console.log("<====Обычный клик====>");
    }
  };

  const getSubtreeIndices = (index: number, stones: Stone[]): number[] => {
    const stone = stones[index];
    if (!stone) return [];
    const result: number[] = [index];
    const children = stones
      .map((s, i) => ({ stone: s, index: i }))
      .filter(({ stone }) => stone.parentId === stone.id)
      .map(({ index }) => index);
    for (const childIndex of children) {
      result.push(...getSubtreeIndices(childIndex, stones));
    }
    return result.sort((a, b) => a - b);
  };

  const moveUp = () => {
    if (selectedStones.length === 0) return;

    setStones((prev) => {
      const newStones = [...prev];
      const newSelected: number[] = [];

      const sortedSelected = [...selectedStones].sort((a, b) => a - b);

      for (const index of sortedSelected) {
        const subtreeIndices = getSubtreeIndices(index, newStones);
        const minIndex = Math.min(...subtreeIndices);
        if (minIndex === 0) continue;

        const subtree = subtreeIndices.map((i) => newStones[i]);
        subtreeIndices
          .sort((a, b) => b - a)
          .forEach((i) => newStones.splice(i, 1));
        newStones.splice(minIndex - 1, 0, ...subtree);
        newSelected.push(minIndex - 1);
      }

      setSelectedStones(newSelected);
      return newStones;
    });
  };

  const moveDown = () => {
    if (selectedStones.length === 0) return;

    setStones((prev) => {
      const newStones = [...prev];
      const newSelected: number[] = [];

      const sortedSelected = [...selectedStones].sort((a, b) => b - a);

      for (const index of sortedSelected) {
        const subtreeIndices = getSubtreeIndices(index, newStones);
        const maxIndex = Math.max(...subtreeIndices);
        if (maxIndex >= newStones.length - 1) continue;

        const subtree = subtreeIndices.map((i) => newStones[i]);
        subtreeIndices
          .sort((a, b) => b - a)
          .forEach((i) => newStones.splice(i, 1));
        newStones.splice(maxIndex + 1, 0, ...subtree);
        newSelected.push(maxIndex + 1 - (subtreeIndices.length - 1));
      }

      setSelectedStones(newSelected);
      return newStones;
    });
  };

  const getTagName = (tag: string): string => {
    const match = tag.match(/^<([a-z0-9]+)/i);
    return match ? match[1].toLowerCase() : "";
  };

  const handlerCopy = (e: React.MouseEvent<HTMLButtonElement>) => {
    navigator.clipboard.writeText(convertStonesToHtml(stones));
    if (Duplicate.current) {
      (Duplicate.current as any).style.boxShadow = "0 0 10px cyan";
      setTimeout(() => {
        if (Duplicate.current) {
          (Duplicate.current as any).style.boxShadow = "none";
        }
      }, 300);
    }
  };

  const handlerCopyPug = () => {
    const html = convertStonesToHtml(stones);
    const pugOutput = htmlToPug(html);
    navigator.clipboard.writeText(pugOutput);
    if (CopyPug.current) {
      (CopyPug.current as any).style.boxShadow = "0 0 10px blue";
      setTimeout(() => {
        if (CopyPug.current) {
          (CopyPug.current as any).style.boxShadow = "none";
        }
      }, 300);
    }
  };

  const handlerCopyScss = () => {
    const html = convertStonesToHtml(stones);
    const scssOutput = htmlToScss(html).scss;
    navigator.clipboard.writeText(scssOutput);
    if (CopyScss.current) {
      (CopyScss.current as any).style.boxShadow = "0 0 10px green";
      setTimeout(() => {
        if (CopyScss.current) {
          (CopyScss.current as any).style.boxShadow = "none";
        }
      }, 300);
    }
  };

  const handlerClear = () => {
    setStone([]);
    setStones([]);
    setSelectedStones([]);
    setSnipets("");
    if (Mark.current) {
      (Mark.current as any).style.boxShadow = "0 0 10px red";
      setTimeout(() => {
        if (Mark.current) {
          (Mark.current as any).style.boxShadow = "none";
        }
      }, 300);
    }
  };

  const StoneNode = ({ s }: { s: Stone }) => {
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
      e.dataTransfer.setData("text/plain", s.id.toString());
      e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (
      e: React.DragEvent<HTMLDivElement>,
      isRoot: boolean = false
    ) => {
      e.preventDefault();
      const draggedId = parseInt(e.dataTransfer.getData("text/plain"), 10);
      if (draggedId === s.id && !isRoot) return;

      if (isRoot) {
        setStones((prev) => {
          const getSubtreeIds = (
            stoneId: number,
            stones: Stone[]
          ): number[] => {
            const result: number[] = [stoneId];
            const children = stones.filter((s) => s.parentId === stoneId);
            for (const child of children) {
              result.push(...getSubtreeIds(child.id, stones));
            }
            return result;
          };

          const subtreeIds = getSubtreeIds(draggedId, prev);
          const newStones = prev.filter(
            (stone) => !subtreeIds.includes(stone.id)
          );
          return newStones;
        });
        return;
      }

      const draggedStone = stones.find((stone) => stone.id === draggedId);
      const targetStone = stones.find((stone) => stone.id === s.id);

      if (!draggedStone) {
        console.error("Dragged stone not found:", draggedId);
        return;
      }

      const draggedTagName = getTagName(draggedStone.content);
      const targetTagName = targetStone ? getTagName(targetStone.content) : "";

      let errorMessage = "";
      if (targetStone) {
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
        const interactiveElements = [
          "a",
          "button",
          "input",
          "select",
          "textarea",
        ];
        if (
          targetTagName === "a" &&
          interactiveElements.includes(draggedTagName)
        ) {
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

      setStones((prev) => {
        const getSubtree = (stoneId: number, stones: Stone[]): Stone[] => {
          const result: Stone[] = [];
          const stone = stones.find((s) => s.id === stoneId);
          if (!stone) return result;
          result.push(stone);
          const children = stones.filter((s) => s.parentId === stoneId);
          for (const child of children) {
            result.push(...getSubtree(child.id, stones));
          }
          return result;
        };

        const subtree = getSubtree(draggedId, prev);
        const subtreeIds = subtree.map((s) => s.id);

        let newStones = prev.filter((stone) => !subtreeIds.includes(stone.id));

        const newLevel = targetStone ? targetStone.level + 1 : 0;
        const levelOffset = newLevel - draggedStone.level;

        const updatedSubtree = subtree.map((stone) => ({
          ...stone,
          level: stone.level + levelOffset,
          parentId:
            stone.id === draggedId ? targetStone?.id ?? null : stone.parentId,
        }));

        let insertIndex: number;
        if (targetStone && targetStone.id) {
          const targetIndex = newStones.findIndex(
            (stone) => stone.id === targetStone.id
          );
          if (targetIndex === -1) {
            console.error("Целевой элемент не найден в newStones");
            return prev;
          }
          const lastChildIndex = newStones
            .slice(targetIndex + 1)
            .findIndex((stone) => stone.level <= targetStone.level);
          insertIndex =
            lastChildIndex === -1
              ? newStones.length
              : targetIndex + 1 + lastChildIndex;
        } else {
          insertIndex = newStones.length;
        }

        newStones.splice(insertIndex, 0, ...updatedSubtree);
        return newStones;
      });
    };

    return (
      <div
        className={`rounded border border-red-300 flex  items-center gap-2 bg-slate-200 ${
          selectedStones.includes(
            stones.findIndex((stone) => stone.id === s.id)
          )
            ? styles.selected
            : ""
        }`}
        style={{ marginLeft: `${s.level * 20}px` }}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, false)}
        onClick={(event) => {
          const index = stones.findIndex((stone) => stone.id === s.id);
          handleSelectStone(index);
          handleClick(event);
        }}
      >
        <button
          type="button"
          onClick={() =>
            handleDrop(
              {
                preventDefault: () => {},
                dataTransfer: { getData: () => s.id.toString() },
              } as any,
              true
            )
          }
          className="p-1 bg-gray-200 text-gray-500 text-sm rounded hover:bg-gray-300"
        >
          <XMarkIcon width={8} height={8} />
        </button>
        <p className="text-sm">{s.content}</p>
      </div>
    );
  };

  const convertStonesToHtml = (stones: Stone[]): string => {
    const parseTag = (
      content: string
    ): { tag: string; attributes: string; isSelfClosing: boolean } => {
      const tagMatch = content.match(/^<([a-z0-9]+)([^>]*)>/i);
      if (!tagMatch) {
        return { tag: "", attributes: "", isSelfClosing: false };
      }
      const tag = tagMatch[1].toLowerCase();
      const attributes = tagMatch[2].trim();
      const isSelfClosing = selfClosingTags.includes(tag);
      return { tag, attributes, isSelfClosing };
    };

    const buildHtml = (
      stoneId: number,
      stones: Stone[],
      processed: Set<number>
    ): string => {
      const stone = stones.find((s) => s.id === stoneId);
      if (!stone || processed.has(stoneId)) {
        return "";
      }
      processed.add(stoneId);

      const { tag, attributes, isSelfClosing } = parseTag(stone.content);
      if (!tag) {
        return stone.content;
      }

      const children = stones.filter((s) => s.parentId === stoneId);
      let childrenHtml = "";

      for (const child of children) {
        childrenHtml += buildHtml(child.id, stones, processed);
      }

      if (isSelfClosing) {
        return `<${tag}${attributes ? ` ${attributes}` : ""}>`;
      }

      return `<${tag}${
        attributes ? ` ${attributes}` : ""
      }>${childrenHtml}</${tag}>`;
    };

    const processed = new Set<number>();
    let result = "";

    const rootStones = stones.filter((stone) => stone.parentId === null);
    for (const root of rootStones) {
      result += buildHtml(root.id, stones, processed);
    }

    return result;
  };

  const handleRootDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const draggedId = parseInt(e.dataTransfer.getData("text/plain"), 10);
    const draggedStone = stones.find((stone) => stone.id === draggedId);

    if (!draggedStone) {
      console.error("Dragged stone not found:", draggedId);
      return;
    }

    setStones((prev) => {
      const getSubtree = (stoneId: number, stones: Stone[]): Stone[] => {
        const result: Stone[] = [];
        const stone = stones.find((s) => s.id === stoneId);
        if (!stone) return result;
        result.push(stone);
        const children = stones.filter((s) => s.parentId === stoneId);
        for (const child of children) {
          result.push(...getSubtree(child.id, stones));
        }
        return result;
      };

      const subtree = getSubtree(draggedId, prev);
      const subtreeIds = subtree.map((s) => s.id);

      let newStones = prev.filter((stone) => !subtreeIds.includes(stone.id));

      const levelOffset = 0 - draggedStone.level;
      const updatedSubtree = subtree.map((stone) => ({
        ...stone,
        level: stone.level + levelOffset,
        parentId: stone.id === draggedId ? null : stone.parentId,
      }));

      newStones.push(...updatedSubtree);
      return newStones;
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  return (
    <div className="grid grid-cols-[max-content_1fr] ">
      {error && <ModalMessage message={error} open={showModal} />}
      <div className="max-w-[300px]">
        <LocalSnipets
          snipets={snipets}
          setSnipets={setSnipets}
          storedSnipets={storedSnipets}
          setStoredSnipets={setStoredSnipets}
          snipOpen={snipOpen}
          setSnipOpen={setSnipOpen}
          setStones={setStones}
          selectedStones={selectedStones}
          stones={stones}
        />
      </div>
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
                alt="html"
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
              disabled={selectedStones.length === 0}
              className="w-8 h-8 bg-blue-500 rounded-full border border-gray-300 flex items-center justify-center leading-none text-[14px] cursor-pointer hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out"
            >
              <ArrowUpIcon className="w-4 h-4 text-white" />
            </button>
            <button
              type="button"
              onClick={moveDown}
              disabled={selectedStones.length === 0}
              className="w-8 h-8 bg-blue-500 rounded-full border border-gray-300 flex items-center justify-center leading-none text-[14px] cursor-pointer hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out"
            >
              <ArrowDownIcon className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="plaza rounded border border-zinc-300">
            <div
              className="p-2 bg-blue-300 flex justify-center text-gray-500 cursor-move mb-2"
              onDragOver={handleDragOver}
              onDrop={handleRootDrop}
            >
              <ArrowUpIcon className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              {stones.map((s) => (
                <StoneNode key={s.id} s={s} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plaza;
