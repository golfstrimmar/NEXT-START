"use client";
import React, { useState, useEffect } from "react";
import styles from "./LocalSnipets.module.scss";
import Input from "../ui/Input/Input";
import TagTree from "../TagTree/TagTree";
// =================================
interface LocalSnipetsProps {
  snipets: any;
  setSnipets: any;
  storedSnipets: any;
  setStoredSnipets: any;
  setSelectedTags: any;
  selectedTags: any;
  setTags: any;
  snipOpen: boolean;
  setSnipOpen: any;
}
// =================================
const LocalSnipets: React.FC<LocalSnipetsProps> = ({
  snipets,
  setSnipets,
  storedSnipets,
  setStoredSnipets,
  setSelectedTags,
  selectedTags,
  setTags,
  snipOpen,
  setSnipOpen,
}) => {
  // Функция для сохранения нового сниппета
  const copySnipet = () => {
    if (snipets) {
      // Получаем текущие сниппеты из localStorage
      let localSnipets = [];
      try {
        const stored = localStorage.getItem("snipets");
        if (stored) {
          localSnipets = JSON.parse(stored);
          // Проверяем, является ли результат массивом
          if (!Array.isArray(localSnipets)) {
            localSnipets = [];
          }
        }
      } catch (e) {
        console.error("Ошибка парсинга localStorage:", e);
        localSnipets = [];
      }

      // Создаем новый сниппет
      const newSnipet = {
        id: localSnipets.length + 1,
        value: snipets, // Сохраняем как строку или массив, в зависимости от ввода
      };

      // Добавляем новый сниппет в массив
      const newSnipets = [...localSnipets, newSnipet];

      // Сохраняем в localStorage
      localStorage.setItem("snipets", JSON.stringify(newSnipets));
      setStoredSnipets(newSnipets); // Обновляем состояние
      setSnipets(""); // Очищаем поле ввода
      setSelectedTags([]);
    }
  };

  // Загрузка сниппетов при монтировании компонента
  useEffect(() => {
    const loadSnipets = () => {
      try {
        const localSnipets = localStorage.getItem("snipets");
        if (localSnipets) {
          const parsedSnipets = JSON.parse(localSnipets);
          if (Array.isArray(parsedSnipets)) {
            setStoredSnipets(parsedSnipets);
          } else {
            console.warn(
              "Данные в localStorage не являются массивом:",
              parsedSnipets
            );
            setStoredSnipets([]);
          }
        }
      } catch (e) {
        console.error("Ошибка загрузки сниппетов:", e);
        setStoredSnipets([]);
      }
    };

    loadSnipets();
  }, []);

  // Подписка на изменения localStorage
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "snipets") {
        try {
          const updatedSnipets = event.newValue
            ? JSON.parse(event.newValue)
            : [];
          if (Array.isArray(updatedSnipets)) {
            setStoredSnipets(updatedSnipets);
          } else {
            console.warn(
              "Обновленные данные не являются массивом:",
              updatedSnipets
            );
          }
        } catch (e) {
          console.error("Ошибка парсинга обновленных данных:", e);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);
  // ==============================
  const removeSnipet = (id: number) => {
    const updatedSnipets = storedSnipets.filter(
      (snipet: any) => snipet.id !== id
    );
    localStorage.setItem("snipets", JSON.stringify(updatedSnipets));
    setStoredSnipets(updatedSnipets);
  };
  // ==============================
  return (
    <div
      className={`p-2 absolute  l-0 transform transition-all duration-200 ease-in-out bg-gray-200 ${
        snipOpen ? "relative translate-x-0" : " translate-x-[-150%]"
      } `}
    >
      <Input
        typeInput="text"
        data=""
        value={snipets}
        onChange={(e) => setSnipets(e.target.value)}
      />
      <button
        type="button"
        onClick={copySnipet}
        disabled={selectedTags.length === 0}
        className="my-2 p-4 h-8 bg-blue-500 rounded-[5px] border border-gray-300 flex items-center justify-center leading-none text-[14px] cursor-pointer hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out text-white"
      >
        Save Snipet
      </button>
      <ul className="my-2  flex flex-col gap-1">
        {storedSnipets.map((snipet: any) => (
          <div key={snipet.id}>
            <button
              key={snipet.id}
              className=" border border-gray-300 rounded text-left"
              onClick={() => {
                setTags((prev: string[]) => [...prev, ...snipet.value]);
              }}
            >
              <TagTree tags={snipet.value} />
            </button>{" "}
            <button
              className=" w-full bg-red-500 text-amber-50 hover:bg-red-600 transition-all duration-200 ease-in-out cursor-pointer"
              onClick={() => removeSnipet(snipet.id)}
            >
              X
            </button>
          </div>
        ))}
      </ul>
    </div>
  );
};

export default LocalSnipets;
