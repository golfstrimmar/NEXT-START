"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface Stone {
  name: string;
  value: string;
}

interface StateContextType {
  stone: Stone[];
  setStone: React.Dispatch<React.SetStateAction<Stone[]>>;
  handlerEnterStone: (name: string, value: string) => void;
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export function StateProvider({ children }: { children: ReactNode }) {
  const [stone, setStone] = useState<Stone[]>([]);
  const [openModal, setOpenModal] = useState(false);

  const handlerEnterStone = (name: string, value: string) => {
    setStone((prev) => [...prev, { name, value }]);
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
