"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface Stone {
  tag: string;
  className?: string;
  subClassName?: string;
}

interface StateContextType {
  stone: Stone[];
  setStone: React.Dispatch<React.SetStateAction<Stone[]>>;
  handlerEnterStone: (
    name: string,
    input: string,
    subClassName?: string
  ) => void;
  lastTags: string[];
  handlerLastTags: (tags: string[]) => void;
  handlerSetTags: (tags: string[]) => void;
  providerTags: string[];
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export function StateProvider({ children }: { children: ReactNode }) {
  const [stone, setStone] = useState<Stone[]>([]);
  const [lastTags, setLastTags] = useState<string[]>([]);
  const [providerTags, setProviderTags] = useState<string[]>([]);
  const handlerLastTags = (tags: string[]) => {
    setLastTags(tags);
  };
  const handlerSetTags = (tags: string[]) => {
    setProviderTags(tags);
  };
  const handlerEnterStone = (
    name: string,
    className: string,
    subClassName?: string,
    extraClass?: string
  ) => {
    setStone((prev) => {
      if (name === "" && className !== "" && !subClassName && !extraClass) {
        return [
          ...prev,
          { tag: "div", className, subClassName: "", extraClass: "" },
        ];
      }
      if (name !== "" && className === "" && !subClassName && !extraClass) {
        return [
          ...prev,
          { tag: name, className: "", subClassName: "", extraClass: "" },
        ];
      }
      if (name !== "" && className !== "" && !subClassName) {
        return [
          ...prev,
          { tag: name, className, subClassName: "", extraClass: "" },
        ];
      }
      if (subClassName) {
        return [
          ...prev,
          { tag: name, className, subClassName, extraClass: extraClass || "" },
        ];
      }
      if (extraClass) {
        return [
          ...prev,
          {
            tag: name,
            className,
            subClassName: subClassName || "",
            extraClass,
          },
        ];
      }
      return prev;
    });
  };

  return (
    <StateContext.Provider
      value={{
        stone,
        setStone,
        handlerEnterStone,
        lastTags,
        handlerLastTags,
        handlerSetTags,
        providerTags,
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
