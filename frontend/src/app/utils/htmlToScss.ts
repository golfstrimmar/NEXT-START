import { parseFragment } from "parse5";
import { ChildNode, Element } from "parse5/dist/tree-adapters/default";

function htmlToScss(html: string): string {
  const document = parseFragment(html);
  let scssOutput = "";

  function processNode(node: ChildNode, indentLevel: number = 0): void {
    if (node.nodeName === "#text" || node.nodeName === "#document-fragment") {
      // Игнорируем текстовые узлы и фрагменты, обрабатываем только элементы
      (node as any).childNodes?.forEach((child: ChildNode) =>
        processNode(child, indentLevel)
      );
      return;
    }

    const element = node as Element;
    const tagName = element.tagName;
    const indent = "  ".repeat(indentLevel);

    // Собираем классы
    let classNames: string[] = [];
    for (const attr of element.attrs) {
      if (attr.name === "class" || attr.name === "className") {
        classNames = attr.value.split(/\s+/).filter(Boolean);
      }
    }

    // Формируем селектор: всегда включаем имя тега
    let selector = tagName;
    if (classNames.length > 0) {
      selector += classNames.map((cls) => `.${cls}`).join("");
    }

    // Добавляем селектор и открывающую скобку
    scssOutput += `${indent}${selector} {\n`;

    // Обрабатываем дочерние узлы
    element.childNodes.forEach((child) => processNode(child, indentLevel + 1));

    // Закрывающая скобка
    scssOutput += `${indent}}\n`;
  }

  document.childNodes.forEach((node) => processNode(node, 0));
  return scssOutput.trim();
}

export default htmlToScss;
