"use client";
import React, { useState, useEffect } from "react";
import Input from "../ui/Input/Input";
import Button from "../ui/Button/Button";

interface FormNoteProps {
  initialData?: {
    id: string;
    name: string;
    value: string[];
    category?: string;
  };
  onSuccess?: () => void;
  onEdit?: boolean;
  onCancel?: () => void;
}

const FormNote: React.FC<FormNoteProps> = ({
  initialData,
  onSuccess,
  onEdit = false,
  onCancel,
}) => {
  const [name, setName] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Инициализация формы при изменении initialData или режима
  useEffect(() => {
    setName(initialData?.name || "");
    setText(initialData?.value.join("\n") || "");
    setCategory(initialData?.category || "");
    setError(null);
  }, [initialData, onEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Валидация полей
    if (!name.trim() || !text.trim()) {
      setError("Название и содержимое заметки обязательны");
      setIsLoading(false);
      return;
    }

    try {
      const url = "/api/notes";
      const method = onEdit ? "PUT" : "POST";
      const body = JSON.stringify({
        ...(onEdit && initialData && { id: initialData.id }),
        name: name.trim(),
        value: text
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line !== ""),
        category: category.trim() || "без категории", // Если категория не указана
      });

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ошибка при сохранении");
      }

      onSuccess?.();

      // Сброс формы только при создании новой заметки
      if (!onEdit) {
        setName("");
        setText("");
        setCategory("");
      }
    } catch (err) {
      console.error("Ошибка:", err);
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-gray-300 rounded-lg p-4 space-y-4"
    >
      <h2 className="text-xl font-semibold">
        {onEdit ? "Редактировать заметку" : "Новая заметка"}
      </h2>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Название заметки
        </label>
        <Input
          typeInput="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Категория (необязательно)
        </label>
        <Input
          typeInput="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Содержимое (каждый пункт с новой строки)
        </label>
        <Input
          typeInput="textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          disabled={isLoading}
          rows={5}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        {onEdit && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            variant="outline"
            disabled={isLoading}
          >
            Отмена
          </button>
        )}

        <Button type="submit" disabled={isLoading} isLoading={isLoading}>
          {onEdit ? "Сохранить изменения" : "Создать заметку"}
        </Button>
      </div>
    </form>
  );
};

export default FormNote;
