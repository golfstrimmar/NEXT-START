"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface Stone {
  tag: string;
  className?: string;
  content?: string;
}

interface StateContextType {
  stone: Stone[];
  setStone: React.Dispatch<React.SetStateAction<Stone[]>>;
  handlerEnterStone: (name: string, input: string) => void;
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export function StateProvider({ children }: { children: ReactNode }) {
  const [stone, setStone] = useState<Stone[]>([]);
  const [openModal, setOpenModal] = useState(false);

  const handlerEnterStone = (name: string, input: string) => {
    setStone((prev) => {
      if (name === "tag") {
        // Добавляем новый тег
        return [...prev, { tag: input }];
      } else if (name === "class" && prev.length > 0) {
        // Добавляем класс к последнему тегу
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          className: input,
        };
        return updated;
      }
      return prev; // Игнорируем класс, если нет тегов
    });
  };

  return (
    <StateContext.Provider
      value={{
        stone,
        setStone,
        handlerEnterStone,
        openModal,
        setOpenModal,
      }}
    >
      {children}
    </StateContext.Provider>
  );
}

export function useStateContext() {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error("useStateContext must be used within a StateProvider");
  }
  return context;
}
