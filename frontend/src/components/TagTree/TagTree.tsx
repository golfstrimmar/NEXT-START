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
    "use",
  ];

  const parseTagsToTree = (tags: string[]): TagNode[] => {
    if (typeof window === "undefined" || !window.DOMParser) {
      // console.log("DOMParser недоступен");
      return [];
    }

    // Проверка, является ли tags массивом
    if (!Array.isArray(tags)) {
      // console.error("Проп tags должен быть массивом строк, получено:", tags);
      return [];
    }

    const parser = new DOMParser();
    const nodes: TagNode[] = [];

    tags.forEach((tag, index) => {
      // Пропускаем пустые или невалидные строки
      if (!tag || typeof tag !== "string" || tag.trim() === "") {
        // console.warn(`Пропущен невалидный тег на индексе ${index}:`, tag);
        return;
      }

      try {
        // Определяем тип контента: SVG или HTML
        const isSvg = tag.trim().toLowerCase().startsWith("<svg");
        let mimeType = isSvg ? "application/xml" : "text/html";
        let parseString = tag;

        // Для SVG добавляем пространства имён
        if (isSvg) {
          parseString = tag.replace(
            /^<svg/,
            `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"`
          );
        } else {
          parseString = `<div>${tag}</div>`;
        }

        // console.log(`Parsing tag: ${parseString}, mimeType: ${mimeType}`);

        // Парсим тег
        let doc = parser.parseFromString(parseString, mimeType);
        // console.log("Parsed document:", doc);

        // Если XML-парсинг не удался, пробуем text/html как fallback
        if (isSvg && doc.parseError) {
          console.warn(`XML parsing failed for tag: ${tag}, trying text/html`);
          mimeType = "text/html";
          parseString = `<div>${tag}</div>`;
          doc = parser.parseFromString(parseString, mimeType);
          // console.log("Fallback parsed document:", doc);
        }

        // Для SVG используем documentElement, для HTML — первый дочерний элемент
        const rootElement = isSvg
          ? doc.documentElement
          : doc.body.firstChild?.firstChild;

        const createNode = (element: Element): TagNode => {
          const attributes: Record<string, string> = {};
          Array.from(element.attributes).forEach((attr) => {
            attributes[attr.name || ""] = attr.value || "";
          });

          const children: TagNode[] = Array.from(element.children)
            .filter((child): child is Element => child instanceof Element)
            .map((child) => createNode(child));

          return {
            name: element.tagName.toLowerCase(),
            attributes,
            children,
          };
        };

        if (rootElement instanceof Element) {
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
    <div className="bg-gray-300 border-l border-gray-300 h-full overflow-auto -z-2">
      {tree.length > 0 && (
        <ul className="text-sm font-mono">
          {tree.map((node, index) => (
            <React.Fragment key={index}>
              {renderNode(node, 0, index)}
            </React.Fragment>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TagTree;
