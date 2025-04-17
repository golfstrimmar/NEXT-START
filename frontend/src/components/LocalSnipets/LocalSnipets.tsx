"use client";
import React, { useState, useEffect, useMemo } from "react";
import styles from "./LocalSnipets.module.scss";
import Input from "../ui/Input/Input";
import TagTree from "../TagTree/TagTree";
import { XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { set } from "mongoose";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [snipetIdToDelete, setSnipetIdToDelete] = useState<number | null>(null);
  const [category, setCategory] = useState("local");
  const [categories, setCategories] = useState<string[]>([]);
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const copySnipet = async () => {
    if (snipets) {
      try {
        const response = await fetch("/api/snipets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: new Date().getTime(),
            value: Array.isArray(snipets) ? snipets : [snipets],
            category,
          }),
        });

        if (!response.ok) {
          setError("Failed to save snipet");
          setTimeout(() => setError(""), 1000);
          throw new Error("Failed to save snipet");
        }

        const { snipet } = await response.json();
        setStoredSnipets((prev: any) => [...prev, snipet]);
        setSnipets("");
        setCategory("local");
        setSelectedTags([]);
      } catch (error) {
        console.error("Ошибка сохранения сниппета:", error);
      }
    }
  };

  const fetchSnipets = async () => {
    try {
      const response = await fetch("/api/snipets", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch snipets");
      }

      const snipets = await response.json();
      setStoredSnipets(snipets);
    } catch (error) {
      console.error("Ошибка получения сниппетов:", error);
      setStoredSnipets([]);
    }
  };

  const removeSnipet = async (id: number) => {
    try {
      const response = await fetch("/api/snipets", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete snipet");
      }

      setStoredSnipets((prev: any) =>
        prev.filter((snipet: any) => snipet.id !== id)
      );
      setIsModalOpen(false);
      setSnipetIdToDelete(null);
      setCategory("local");
    } catch (error) {
      console.error("Ошибка удаления сниппета:", error);
    }
  };

  const openDeleteModal = (id: number) => {
    setSnipetIdToDelete(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSnipetIdToDelete(null);
  };

  const toggleTab = (category: string) => {
    setOpenTabs((prev) =>
      prev.includes(category)
        ? prev.filter((cat) => cat !== category)
        : [...prev, category]
    );
  };

  useEffect(() => {
    fetchSnipets();
  }, []);

  useEffect(() => {
    if (storedSnipets.length > 0) {
      const uniqueCategories = Array.from(
        new Set(
          storedSnipets.map((snipet: any) => snipet.category).filter(Boolean)
        )
      );
      setCategories(uniqueCategories);
    } else {
      setCategories([]);
      setOpenTabs([]);
    }
  }, [storedSnipets]);

  const displayCategory = useMemo(
    () => (category: string) => {
      return storedSnipets.filter(
        (snipet: any) => snipet.category === category
      );
    },
    [storedSnipets]
  );

  return (
    <div
      className={`p-2 absolute l-0 transform transition-all duration-200 ease-in-out bg-gray-200 ${
        snipOpen ? "relative translate-x-0" : "translate-x-[-150%]"
      }`}
    >
      <Input
        typeInput="text"
        data="snipet"
        value={snipets}
        onChange={(e) => setSnipets(e.target.value)}
      />
      <Input
        typeInput="text"
        data="category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      {error.length > 0 && <p className="text-red-500">{error}</p>}
      <button
        type="button"
        onClick={copySnipet}
        disabled={selectedTags.length === 0 || snipets.length === 0}
        className="my-2 p-4 h-8 bg-blue-500 rounded-[5px] border border-gray-300 flex items-center justify-center leading-none text-[14px] cursor-pointer hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out text-white"
      >
        Save Snipet
      </button>
      <div className="my-2 flex flex-col gap-2">
        {/* Секция для категории "local" */}
        {categories.includes("local") && (
          <div className="border-b border-gray-300">
            <h3 className="px-4 py-2 text-sm font-medium text-gray-600">
              local
            </h3>
            <ul className="flex flex-col gap-1 px-4 pb-2">
              {displayCategory("local").map((snipet: any) => (
                <div key={snipet.id} className="flex gap-1">
                  <button
                    className="w-4 h-4 bg-red-500 text-amber-50 hover:bg-red-600 transition-all duration-200 ease-in-out cursor-pointer flex items-center justify-center"
                    onClick={() => openDeleteModal(snipet.id)}
                  >
                    <XMarkIcon className="max-w-3 h-3 text-white" />
                  </button>
                  <button
                    className="border border-gray-300 rounded text-left"
                    onClick={() => {
                      setTags((prev: string[]) => [...prev, ...snipet.value]);
                    }}
                  >
                    <TagTree tags={snipet.value} />
                  </button>
                </div>
              ))}
            </ul>
          </div>
        )}

        {/* Табы для остальных категорий */}
        {categories && categories.length > 0 ? (
          categories
            .filter((cat) => cat !== "local")
            .map((category) => (
              <div key={category} className="border-b border-gray-300">
                <button
                  onClick={() => toggleTab(category)}
                  className="w-full flex justify-between items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-500 transition-all duration-200 ease-in-out"
                >
                  <span>{category}</span>
                  <ChevronDownIcon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      openTabs.includes(category) ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openTabs.includes(category) && (
                  <ul className="flex flex-col gap-1 px-4 pb-2">
                    {displayCategory(category).map((snipet: any) => (
                      <div key={snipet.id} className="flex gap-1">
                        <button
                          className="w-4 h-4 bg-red-500 text-amber-50 hover:bg-red-600 transition-all duration-200 ease-in-out cursor-pointer flex items-center justify-center"
                          onClick={() => openDeleteModal(snipet.id)}
                        >
                          <XMarkIcon className="max-w-3 h-3 text-white" />
                        </button>
                        <button
                          className="border border-gray-300 rounded text-left"
                          onClick={() => {
                            setTags((prev: string[]) => [
                              ...prev,
                              ...snipet.value,
                            ]);
                          }}
                        >
                          <TagTree tags={snipet.value} />
                        </button>
                      </div>
                    ))}
                  </ul>
                )}
              </div>
            ))
        ) : !categories.includes("local") ? (
          <p>Нет категорий</p>
        ) : null}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 top-0 flex justify-center bg-black bg-opacity-50">
          <div className="bg-red-100 p-4 rounded shadow-lg max-w-sm w-full">
            <p className="mb-4">Delete?</p>
            <div className="flex justify-start gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-all duration-200 ease-in-out"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() =>
                  snipetIdToDelete !== null && removeSnipet(snipetIdToDelete)
                }
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-all duration-200 ease-in-out"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocalSnipets;
