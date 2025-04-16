import { parse } from "parse5";
import { ChildNode, Element } from "parse5/dist/tree-adapters/default";

interface ValidationError {
  message: string;
  tag: string;
  parentTag?: string;
  severity: "error" | "warning";
}

interface ScssResult {
  scss: string;
  errors: ValidationError[];
  domTree: string;
  isValid: boolean;
}

function visualizeDomTree(node: ChildNode, depth: number = 0): string {
  const indent = "  ".repeat(depth);
  let output = "";

  if (node.nodeName === "#text") {
    const value = (node as any).value.trim();
    if (value) {
      output += `${indent}Text: "${value.slice(0, 20)}${
        value.length > 20 ? "..." : ""
      }"\n`;
    }
    return output;
  }

  if (node.nodeName === "#document-fragment" || node.nodeName === "#document") {
    const element = node as Element;
    return element.childNodes
      .map((child) => visualizeDomTree(child, depth))
      .join("");
  }

  const element = node as Element;
  const tagName = element.tagName;
  const attrs = element.attrs
    .map((attr) => `${attr.name}="${attr.value}"`)
    .join(" ");

  output += `${indent}<${tagName}${attrs ? ` ${attrs}` : ""}>\n`;
  element.childNodes.forEach((child) => {
    output += visualizeDomTree(child, depth + 1);
  });

  return output;
}

function htmlToScss(html: string): ScssResult {
  const document = parse(`<html><body>${html}</body></html>`);
  const bodyNode = document.childNodes
    .find((node) => node.nodeName === "html")
    ?.childNodes.find((node) => node.nodeName === "body") as
    | Element
    | undefined;
  const nodes = bodyNode?.childNodes || [];

  let scssOutput = "";
  const errors: ValidationError[] = [];
  const domTree = visualizeDomTree(bodyNode || document);

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

  function collectErrors(node: ChildNode, parentTag?: string): void {
    if (node.nodeName === "#text" || node.nodeName === "#document-fragment") {
      return;
    }

    const element = node as Element;
    const tagName = element.tagName.toLowerCase();

    // Правило 1: Заголовки h1-h6 не должны содержать другие заголовки
    if (/^h[1-6]$/.test(tagName) && parentTag && /^h[1-6]$/.test(parentTag)) {
      errors.push({
        message: `Недопустимая вложенность: <${tagName}> не может быть внутри <${parentTag}>`,
        tag: tagName,
        parentTag,
        severity: "error",
      });
    }

    // Правило 2: Пустые теги не могут содержать дочерние элементы
    if (selfClosingTags.includes(parentTag?.toLowerCase() || "") && tagName) {
      errors.push({
        message: `Недопустимая вложенность: <${parentTag}> не может содержать <${tagName}>`,
        tag: tagName,
        parentTag,
        severity: "error",
      });
    }

    // Правило 3: Строчные элементы не могут содержать блочные
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
    if (
      inlineElements.includes(parentTag?.toLowerCase() || "") &&
      blockElements.includes(tagName)
    ) {
      errors.push({
        message: `Недопустимая вложенность: строчный <${parentTag}> не может содержать блочный <${tagName}>`,
        tag: tagName,
        parentTag,
        severity: "error",
      });
    }

    element.childNodes.forEach((child) => collectErrors(child, tagName));
  }

  nodes.forEach((node) => collectErrors(node));

  const hasCriticalErrors = errors.some((e) => e.severity === "error");

  function processNode(node: ChildNode, indentLevel: number = 0): void {
    if (node.nodeName === "#text" || node.nodeName === "#document-fragment") {
      return;
    }

    const element = node as Element;
    const tagName = element.tagName.toLowerCase();
    const indent = "  ".repeat(indentLevel);

    const classNames = element.attrs
      .filter((attr) => attr.name === "class" || attr.name === "className")
      .flatMap((attr) => attr.value.split(/\s+/).filter(Boolean));

    // Генерируем SCSS для всех тегов, включая пустые
    const selector = tagName + classNames.map((cls) => `.${cls}`).join("");
    scssOutput += `${indent}${selector} {\n`;
    element.childNodes.forEach((child) => processNode(child, indentLevel + 1));
    scssOutput += `${indent}}\n`;
  }

  if (hasCriticalErrors) {
    return {
      scss: "/* SCSS не сгенерирован из-за ошибок валидации HTML */",
      errors,
      domTree,
      isValid: false,
    };
  }

  nodes.forEach((node) => processNode(node, 0));

  return {
    scss: scssOutput.trim() || "/* Пустой SCSS */",
    errors,
    domTree,
    isValid: true,
  };
}

export default htmlToScss;
