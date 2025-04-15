import { parse, parseFragment } from "parse5";
import {
  ChildNode,
  Element,
  TextNode,
} from "parse5/dist/tree-adapters/default";

const selfClosingTags = ["br", "img", "hr", "input", "meta", "link"];

function htmlToPug(html: string): string {
  // Парсим HTML как фрагмент
  const document = parseFragment(html);
  let pugOutput = "";

  function processNode(node: ChildNode, indentLevel: number = 0): void {
    if (node.nodeName === "#text") {
      const textNode = node as TextNode;
      const text = textNode.value.trim();
      if (text) {
        // Преобразуем текст, заменяя неразрывный пробел
        const formattedText = text.replace(/ /g, " ");
        pugOutput += `${"  ".repeat(indentLevel)}| ${formattedText}\n`;
      }
      return;
    }

    if (node.nodeName === "#document-fragment") {
      // Обрабатываем дочерние узлы фрагмента
      (node as any).childNodes.forEach((child: ChildNode) =>
        processNode(child, indentLevel)
      );
      return;
    }

    const element = node as Element;
    const tagName = element.tagName;
    const indent = "  ".repeat(indentLevel);

    // Собираем атрибуты
    let attributes: string[] = [];
    let classNames: string[] = [];

    for (const attr of element.attrs) {
      if (attr.name === "class") {
        classNames = attr.value.split(/\s+/).filter(Boolean);
      } else {
        attributes.push(`${attr.name}="${attr.value}"`);
      }
    }

    // Формируем Pug-синтаксис
    let pugTag = tagName;

    // Добавляем классы в Pug-стиле (.className)
    if (classNames.length > 0) {
      const classString = classNames.map((cls) => `.${cls}`).join("");
      pugTag += classString;
    }

    // Добавляем остальные атрибуты
    if (attributes.length > 0) {
      pugTag += `(${attributes.join(", ")})`;
    }

    // Проверяем, самозакрывающийся ли тег
    const isSelfClosing = selfClosingTags.includes(tagName);
    if (isSelfClosing && element.childNodes.length === 0) {
      pugOutput += `${indent}${pugTag}\n`;
    } else {
      pugOutput += `${indent}${pugTag}\n`;
      // Обрабатываем дочерние узлы
      element.childNodes.forEach((child) =>
        processNode(child, indentLevel + 1)
      );
    }
  }

  // Обрабатываем все узлы
  document.childNodes.forEach((node) => processNode(node, 0));

  return pugOutput.trim();
}

export default htmlToPug;
