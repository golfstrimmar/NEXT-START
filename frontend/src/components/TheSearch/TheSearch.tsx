"use client";
import React, { useState, useCallback } from "react";
import { debounce } from "lodash"; // Установите: npm install lodash
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";

interface Props {
  onSearch: (query: string) => void;
}

const TheSearch = ({ onSearch }: Props) => {
  const [search, setSearch] = useState<string>("");

  // Debounce для оптимизации запросов
  const debouncedSearch = useCallback(
    debounce((query: string) => onSearch(query), 300),
    [onSearch]
  );

  // Обработчик изменения инпута
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    debouncedSearch(value);
  };

  // Обработчик отправки формы
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(search);
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          typeInput="search"
          data=""
          value={search}
          onChange={handleInputChange}
          placeholder="Search messages..."
        />
      </form>
    </div>
  );
};

export default TheSearch;
