"use client";
import React from "react";
import styles from "./TagTree.module.scss";

// =================================
interface TagNode {
  name: string;
  attributes: Record<string, string>;
  children: TagNode[];
}
// =================================
const TagTree: React.FC<{ tags?: string[] }> = ({ tags = [] }) => {
  // Список самозакрывающихся тегов
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

  const parseTagsToTree = (tags: string[]): TagNode[] => {
    if (typeof window === "undefined" || !window.DOMParser) {
      console.log("DOMParser недоступен");
      return [];
    }

    // Проверка, является ли tags массивом
    if (!Array.isArray(tags)) {
      console.error("Проп tags должен быть массивом строк, получено:", tags);
      return [];
    }

    const parser = new DOMParser();
    const nodes: TagNode[] = [];

    tags.forEach((tag, index) => {
      // Пропускаем пустые или невалидные строки
      if (!tag || typeof tag !== "string" || tag.trim() === "") {
        console.warn(`Пропущен невалидный тег на индексе ${index}:`, tag);
        return;
      }

      try {
        // Оборачиваем тег в <div>, чтобы избежать проблем с одиночными тегами
        const doc = parser.parseFromString(`<div>${tag}</div>`, "text/html");
        const rootElement = doc.body.firstChild
          ?.firstChild as HTMLElement | null;

        const createNode = (element: HTMLElement): TagNode => {
          const attributes: Record<string, string> = {};
          Array.from(element.attributes).forEach((attr) => {
            attributes[attr.name || ""] = attr.value || "";
          });

          const children: TagNode[] = Array.from(element.children)
            .filter(
              (child): child is HTMLElement => child instanceof HTMLElement
            )
            .map((child) => createNode(child));

          return {
            name: element.tagName.toLowerCase(),
            attributes,
            children,
          };
        };

        if (rootElement instanceof HTMLElement) {
          nodes.push(createNode(rootElement));
        } else {
          console.warn(`Не удалось распарсить тег на индексе ${index}:`, tag);
        }
      } catch (error) {
        console.error(`Ошибка парсинга тега на индексе ${index}:`, tag, error);
      }
    });

    return nodes;
  };

  const tree = parseTagsToTree(tags);

  // Define colors for different nesting levels
  const depthColors = [
    "text-zinc-900",
    "text-cyan-900",
    "text-lime-800",
    "text-violet-700",
    "text-sky-500",
    "text-amber-700",
    "text-blue-500",
  ];

  const renderNode = (node: TagNode, depth: number = 0, index: number = 0) => {
    const attrString = Object.entries(node.attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(" ");

    const colorClass = depthColors[depth % depthColors.length];
    const nodeKey = `${node.name}-${depth}-${index}`;

    // Для самозакрывающихся тегов рендерим только открывающий тег
    if (selfClosingTags.includes(node.name)) {
      return (
        <li key={nodeKey} className="ml-2">
          <span className={`${colorClass} ${styles.node}`}>
            &lt;{node.name}
            {attrString ? ` ${attrString}` : ""}/&gt;
          </span>
        </li>
      );
    }

    return (
      <li key={nodeKey} className="ml-2">
        <span className={`${colorClass} ${styles.node}`}>
          &lt;{node.name}
          {attrString ? ` ${attrString}` : ""}&gt;
        </span>
        {node.children.length > 0 && (
          <ul className="ml-1">
            {node.children.map((child, childIndex) =>
              renderNode(child, depth + 1, childIndex)
            )}
          </ul>
        )}
        <span className={`${colorClass} ${styles.node}`}>
          &lt;/{node.name}&gt;
        </span>
      </li>
    );
  };

  return (
    <div className=" bg-gray-300 border-l border-gray-300 h-full overflow-auto -z-2">
      {tree.length > 0 ? (
        <ul className="text-sm font-mono">
          {tree.map((node, index) => (
            <React.Fragment key={index}>
              {renderNode(node, 0, index)}
            </React.Fragment>
          ))}
        </ul>
      ) : (
        <p>Нет тегов для отображения</p>
      )}
    </div>
  );
};

export default TagTree;
