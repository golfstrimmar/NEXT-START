"use client";
import React, { useState, useEffect, useMemo } from "react";
import Input from "../ui/Input/Input";
import { XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { parse, parseFragment } from "parse5";
import { ChildNode, Element } from "parse5/dist/tree-adapters/default";

interface Stone {
  id: number;
  content: string;
  level: number;
  parentId: number | null;
}

interface LocalSnipetsProps {
  snipets: any;
  setSnipets: any;
  storedSnipets: any;
  setStoredSnipets: any;
  snipOpen: boolean;
  setSnipOpen: any;
  setStones: React.Dispatch<React.SetStateAction<Stone[]>>;
  selectedStones: number[];
  stones: Stone[];
}

const LocalSnipets: React.FC<LocalSnipetsProps> = ({
  snipets,
  setSnipets,
  storedSnipets,
  setStoredSnipets,
  snipOpen,
  setSnipOpen,
  setStones,
  selectedStones,
  stones,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [snipetIdToDelete, setSnipetIdToDelete] = useState<number | null>(null);
  const [category, setCategory] = useState("local");
  const [categories, setCategories] = useState<string[]>([]);
  const [openTabs, setOpenTabs] = useState<string[]>([]);
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
  ];

  // Функция для преобразования HTML в stones
  const htmlToStones = (htmlArray: string[]): Stone[] => {
    const stones: Stone[] = [];
    let currentId = Date.now();

    const serializeAttributes = (
      attrs: { name: string; value: string }[]
    ): string => {
      return attrs.map((attr) => `${attr.name}="${attr.value}"`).join(" ");
    };

    const processNode = (
      node: ChildNode,
      level: number,
      parentId: number | null,
      parentTag?: string
    ): void => {
      if (node.nodeName === "#text") {
        const text = (node as any).value.trim();
        if (text) {
          const content = text.replace(/ /g, " ");
          stones.push({
            id: currentId++,
            content: content,
            level,
            parentId,
          });
        }
        return;
      }

      if (node.nodeName === "#document-fragment") {
        (node as any).childNodes.forEach((child: ChildNode) =>
          processNode(child, level, parentId)
        );
        return;
      }

      const element = node as Element;
      const tagName = element.tagName;
      const isSelfClosing = selfClosingTags.includes(tagName);
      const attributes = serializeAttributes(element.attrs);
      let content = `<${tagName}${attributes ? ` ${attributes}` : ""}>`;

      if (isSelfClosing) {
        content = `<${tagName}${attributes ? ` ${attributes}` : ""}>`;
      } else {
        content = `<${tagName}${
          attributes ? ` ${attributes}` : ""
        }></${tagName}>`;
      }

      const stoneId = currentId++;
      stones.push({
        id: stoneId,
        content,
        level,
        parentId,
      });

      if (!isSelfClosing) {
        element.childNodes.forEach((child) =>
          processNode(child, level + 1, stoneId, tagName)
        );
      }
    };

    htmlArray.forEach((html) => {
      const fragment = parseFragment(html);
      fragment.childNodes.forEach((node) => processNode(node, 0, null));
    });

    return stones;
  };

  // Исправленная функция для преобразования stones в HTML
  const stonesToHtml = (
    selectedStones: number[],
    stones: Stone[]
  ): string[] => {
    const htmlArray: string[] = [];

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
        return stone.content; // Текстовый узел
      }

      const children = stones.filter((s) => s.parentId === stoneId);
      let childrenHtml = "";

      for (const child of children) {
        childrenHtml += buildHtml(child.id, stones, processed);
      }

      if (isSelfClosing && children.length === 0) {
        return `<${tag}${attributes ? ` ${attributes}` : ""}>`;
      }

      return `<${tag}${
        attributes ? ` ${attributes}` : ""
      }>${childrenHtml}</${tag}>`;
    };

    // Обрабатываем все выделенные stones
    selectedStones.forEach((index) => {
      const stone = stones[index];
      if (!stone) return;
      const processed = new Set<number>();
      const html = buildHtml(stone.id, stones, processed);
      if (html) {
        htmlArray.push(html);
      }
    });

    return htmlArray;
  };

  // Функция для сохранения выбранных stones как сниппета
  const saveSelectedStonesAsSnippet = async () => {
    if (selectedStones.length === 0) {
      setError("No stones selected");
      setTimeout(() => setError(""), 1000);
      return;
    }

    const htmlArray = stonesToHtml(selectedStones, stones);
    if (htmlArray.length === 0) {
      setError("No valid HTML to save");
      setTimeout(() => setError(""), 1000);
      return;
    }

    try {
      const payload = {
        id: new Date().getTime(),
        value: htmlArray,
        category: "local",
      };
      console.log("Saving selected stones as snipet:", payload);

      const response = await fetch("/api/snipets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Failed to save snipet");
        setTimeout(() => setError(""), 1000);
        throw new Error(errorData.error || "Failed to save snipet");
      }

      const { snipet } = await response.json();
      setStoredSnipets((prev: any) => [...prev, snipet]);
    } catch (error) {
      console.error("Ошибка сохранения сниппета:", error);
    }
  };

  const copySnipet = async () => {
    if (!snipets || (typeof snipets === "string" && snipets.trim() === "")) {
      setError("Snippet content is required");
      setTimeout(() => setError(""), 1000);
      return;
    }

    try {
      const payload = {
        id: new Date().getTime(),
        value: Array.isArray(snipets) ? snipets : [snipets.trim()],
        category: category || "local",
      };
      console.log("Saving snipet:", payload);

      const response = await fetch("/api/snipets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Failed to save snipet");
        setTimeout(() => setError(""), 1000);
        throw new Error(errorData.error || "Failed to save snipet");
      }

      const { snipet } = await response.json();
      setStoredSnipets((prev: any) => [...prev, snipet]);
      setSnipets("");
      setCategory("local");
    } catch (error) {
      console.error("Ошибка сохранения сниппета:", error);
    }
  };

  const fetchSnipets = async () => {
    try {
      const response = await fetch("/api/snipets", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch snipets");
      }

      const snipets = await response.json();
      console.log("<====snipets====>", snipets);
      setStoredSnipets(snipets);
    } catch (error) {
      console.error("Ошибка получения сниппетов:", error);
      setStoredSnipets([]);
    }
  };

  const removeSnipet = async (id: number) => {
    try {
      const response = await fetch("/api/snipets", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete snipet");
      }

      setStoredSnipets((prev: any) =>
        prev.filter((snipet: any) => snipet.id !== id)
      );
      setIsModalOpen(false);
      setSnipetIdToDelete(null);
      setCategory("local");
    } catch (error) {
      console.error("Ошибка удаления сниппета:", error);
    }
  };

  const openDeleteModal = (id: number) => {
    setSnipetIdToDelete(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSnipetIdToDelete(null);
  };

  const toggleTab = (category: string) => {
    setOpenTabs((prev) =>
      prev.includes(category)
        ? prev.filter((cat) => cat !== category)
        : [...prev, category]
    );
  };

  useEffect(() => {
    fetchSnipets();
  }, []);

  useEffect(() => {
    if (storedSnipets.length > 0) {
      const uniqueCategories = Array.from(
        new Set(
          storedSnipets.map((snipet: any) => snipet.category).filter(Boolean)
        )
      );
      setCategories(uniqueCategories);
    } else {
      setCategories([]);
      setOpenTabs([]);
    }
  }, [storedSnipets]);

  const displayCategory = useMemo(
    () => (category: string) => {
      return storedSnipets.filter(
        (snipet: any) => snipet.category === category
      );
    },
    [storedSnipets]
  );

  return (
    <div
      className={`p-2 absolute l-0 transform transition-all duration-200 ease-in-out bg-gray-200 ${
        snipOpen ? "relative translate-x-0" : "translate-x-[-150%]"
      }`}
    >
      <Input
        typeInput="text"
        data="snippet"
        value={snipets}
        onChange={(e) => {
          setSnipets(e.target.value);
        }}
      />
      <br />
      <Input
        typeInput="text"
        data="category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      {error.length > 0 && <p className="text-red-500">{error}</p>}
      <button
        type="button"
        onClick={copySnipet}
        disabled={
          (typeof snipets === "string" && snipets.trim() === "") ||
          (Array.isArray(snipets) && snipets.length === 0)
        }
        className="my-2 p-4 h-8 bg-blue-500 rounded-[5px] border border-gray-300 flex items-center justify-center leading-none text-[14px] cursor-pointer hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out text-white"
      >
        Save Snipet
      </button>
      <button
        type="button"
        onClick={saveSelectedStonesAsSnippet}
        disabled={selectedStones.length === 0}
        className="my-2 p-4 h-8 bg-green-500 rounded-[5px] border border-gray-300 flex items-center justify-center leading-none text-[14px] cursor-pointer hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out text-white"
      >
        Save
      </button>
      <div className="my-2 flex flex-col gap-2">
        {categories.includes("local") && (
          <div className="border-b border-gray-300">
            <h3 className="py-2 text-sm font-medium text-gray-600">local</h3>
            <ul className="flex flex-col gap-1 pb-2">
              {displayCategory("local").map((snipet: any) => (
                <div key={snipet.id} className=" overflow-hidden w-full">
                  <button
                    className="w-4 h-4 bg-red-500 text-amber-50 hover:bg-red-600 transition-all duration-200 ease-in-out cursor-pointer flex items-center justify-center"
                    onClick={() => openDeleteModal(snipet.id)}
                  >
                    <XMarkIcon className="max-w-3 h-3 text-white" />
                  </button>
                  <button
                    className="border border-gray-300 rounded text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 w-full"
                    onClick={() => {
                      const newStones = htmlToStones(snipet.value);
                      setStones((prev: Stone[]) => [...prev, ...newStones]);
                    }}
                  >
                    {snipet.value.join(" ")}
                  </button>
                </div>
              ))}
            </ul>
          </div>
        )}
        {categories && categories.length > 0 ? (
          categories
            .filter((cat) => cat !== "local")
            .map((category) => (
              <div key={category} className="border-b border-gray-300">
                <button
                  onClick={() => toggleTab(category)}
                  className="w-full flex justify-between items-center py-2 text-sm font-medium text-gray-600 hover:text-blue-500 transition-all duration-200 ease-in-out"
                >
                  <span>{category}</span>
                  <ChevronDownIcon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      openTabs.includes(category) ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openTabs.includes(category) && (
                  <ul className="flex flex-col gap-1 pb-2">
                    {displayCategory(category).map((snipet: any) => (
                      <div
                        key={snipet.id}
                        className="flex flex-col gap-1 overflow-hidden"
                      >
                        <button
                          className="w-4 h-4 bg-red-500 text-amber-50 hover:bg-red-600 transition-all duration-200 ease-in-out cursor-pointer flex items-center justify-center"
                          onClick={() => openDeleteModal(snipet.id)}
                        >
                          <XMarkIcon className="max-w-3 h-3 text-white" />
                        </button>
                        <button
                          className="border border-gray-300 rounded text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => {
                            const newStones = htmlToStones(snipet.value);
                            setStones((prev: Stone[]) => [
                              ...prev,
                              ...newStones,
                            ]);
                          }}
                        >
                          {snipet.value.join(" ")}
                        </button>
                      </div>
                    ))}
                  </ul>
                )}
              </div>
            ))
        ) : !categories.includes("local") ? (
          <p>Нет категорий</p>
        ) : null}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 top-0 flex justify-center bg-black bg-opacity-50 z-2000">
          <div className="bg-red-100 p-4 rounded shadow-lg max-w-sm w-full">
            <p className="mb-4">Delete?</p>
            <div className="flex justify-start gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="p-2 bg-gray-300 rounded hover:bg-gray-400 transition-all duration-200 ease-in-out"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() =>
                  snipetIdToDelete !== null && removeSnipet(snipetIdToDelete)
                }
                className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-all duration-200 ease-in-out"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocalSnipets;
