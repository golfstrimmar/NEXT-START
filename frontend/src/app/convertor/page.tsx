"use client";
import React, { useState, useRef, useEffect } from "react";
import htmlToScss from "@/app/utils/htmlToScss";
interface ScssResult {
  scss: string;
}

const PugToScssConverter: React.FC = () => {
  const [pugInput, setPugInput] = useState<string>("");
  const [scssOutput, setScssOutput] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const copyScssButtonRef = useRef<HTMLButtonElement>(null);
  const pugTextareaRef = useRef<HTMLTextAreaElement>(null);
  const scssTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Динамическая подстройка высоты для pugInput
  useEffect(() => {
    const textarea = pugTextareaRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // Сбрасываем высоту
      textarea.style.height = `${textarea.scrollHeight}px`; // Устанавливаем высоту по содержимому
    }
  }, [pugInput]);

  // Динамическая подстройка высоты для scssOutput
  useEffect(() => {
    const textarea = scssTextareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [scssOutput]);
  const validateHtml = (html: string): string[] => {
    const errors: string[] = [];
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      if (doc.querySelector("parsererror")) {
        errors.push("Invalid HTML structure");
      }
    } catch (e) {
      errors.push(`HTML parsing error: ${e.message}`);
    }
    return errors;
  };
  useEffect(() => {
    const textarea = scssTextareaRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // Сбрасываем высоту
      textarea.style.height = `${textarea.scrollHeight}px`; // Устанавливаем высоту по содержимому
    }
  }, [scssOutput]);
  const handleConvert = async () => {
    if (!pugInput) {
      setValidationErrors(["Pug code is required"]);
      setScssOutput("");
      return;
    }

    try {
      const response = await fetch("/api/convert-pug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pugCode: pugInput }),
      });
      const { html, error } = await response.json();

      if (error) {
        setValidationErrors([`Pug parsing error: ${error}`]);
        setScssOutput("");
        return;
      }

      const errors = validateHtml(html);
      setValidationErrors(errors);

      if (errors.length > 0) {
        setScssOutput("");
        return;
      }

      const scssResult = htmlToScss(html).scss;
      setScssOutput(scssResult);
    } catch (error) {
      setValidationErrors([`Error fetching HTML: ${error.message}`]);
      setScssOutput("");
    }
  };

  const handlerCopyScss = () => {
    if (validationErrors.length > 0) {
      alert(
        "Невозможно конвертировать в SCSS из-за ошибок в HTML:\n" +
          validationErrors.map((err) => `- ${err}`).join("\n")
      );
      return;
    }
    if (!scssOutput) {
      alert("Нет SCSS для копирования");
      return;
    }
    navigator.clipboard.writeText(scssOutput);
    if (copyScssButtonRef.current) {
      copyScssButtonRef.current.style.boxShadow = "0 0 10px green";
      setTimeout(() => {
        if (copyScssButtonRef.current) {
          copyScssButtonRef.current.style.boxShadow = "none";
        }
      }, 300);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Pug to SCSS Converter</h1>
      <div className="mt-4 flex gap-4 justify-center">
        <button
          onClick={handleConvert}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all"
        >
          Convert
        </button>
        <button
          ref={copyScssButtonRef}
          onClick={handlerCopyScss}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-all"
          disabled={!scssOutput}
        >
          Copy SCSS
        </button>
      </div>
      <div className="w-full  flex flex-col md:flex-row gap-4 justify-center">
        <div className="flex-1">
          <label
            htmlFor="pugInput"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Pug Input
          </label>
          <textarea
            ref={pugTextareaRef}
            id="pugInput"
            value={pugInput}
            onChange={(e) => setPugInput(e.target.value)}
            className="w-full  p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Pug code here..."
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor="scssOutput"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            SCSS Output
          </label>
          <textarea
            id="scssOutput"
            ref={scssTextareaRef}
            value={scssOutput}
            readOnly
            className="w-full  p-2 border border-gray-300 rounded-md bg-gray-50"
            placeholder="SCSS output will appear here..."
          />
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
          <p>Validation Errors:</p>
          <ul className="list-disc pl-5">
            {validationErrors.map((err, index) => (
              <li key={index}>{err}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PugToScssConverter;
