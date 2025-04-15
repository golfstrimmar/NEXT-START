"use client";
import React, { useState, useEffect } from "react";
import styles from "./TagTree.module.scss";

// =================================
interface TagNode {
  name: string;
  attributes: Record<string, string>;
  children: TagNode[];
}
// =================================
const TagTree: React.FC<{ tags: string[] }> = ({ tags }) => {
  const parseTagsToTree = (tags: string[]): TagNode[] => {
    if (typeof window === "undefined" || !window.DOMParser) {
      return [];
    }

    const parser = new DOMParser();
    const nodes: TagNode[] = [];

    tags.forEach((tag) => {
      const doc = parser.parseFromString(tag, "text/html");
      const rootElement = doc.body.firstChild as HTMLElement;

      const createNode = (element: HTMLElement): TagNode => {
        const attributes: Record<string, string> = {};
        Array.from(element.attributes).forEach((attr) => {
          attributes[attr.name] = attr.value;
        });

        const children: TagNode[] = Array.from(element.children)
          .filter((child): child is HTMLElement => child instanceof HTMLElement)
          .map((child) => createNode(child));

        return {
          name: element.tagName.toLowerCase(),
          attributes,
          children,
        };
      };

      if (rootElement) {
        nodes.push(createNode(rootElement));
      }
    });

    return nodes;
  };

  const tree = parseTagsToTree(tags);

  // Define colors for different nesting levels
  const depthColors = [
    "text-zinc-900", // Depth 0
    "text-cyan-900", // Depth 0
    "text-lime-800", // Depth 1
    "text-violet-700", // Depth 1
    "text-sky-500", // Depth 1
    "text-amber-700",
    "text-blue-500", // Depth 1
  ];

  const renderNode = (node: TagNode, depth: number = 0) => {
    const attrString = Object.entries(node.attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(" ");

    // Select color based on depth, cycling through colors if depth exceeds array length
    const colorClass = depthColors[depth % depthColors.length];

    return (
      <li key={`${node.name}-${depth}`} className="ml-4 ">
        <span className={`${colorClass} ${styles.node}`}>
          &lt;{node.name}
          {attrString ? ` ${attrString}` : ""}
          &gt;
        </span>
        {node.children.length > 0 && (
          <ul className="ml-1 ">
            {node.children.map((child) => renderNode(child, depth + 1))}
          </ul>
        )}
        <span className={`${colorClass} ${styles.node}`}>
          &lt;/{node.name}&gt;
        </span>
      </li>
    );
  };

  return (
    <div className="p-4 bg-gray-300 border-l border-gray-300 h-full overflow-auto">
      {tree.length > 0 ? (
        <ul className="text-sm font-mono">
          {tree.map((node) => renderNode(node))}
        </ul>
      ) : null}
    </div>
  );
};

export default TagTree;
