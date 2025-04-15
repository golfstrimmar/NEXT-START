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
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export function StateProvider({ children }: { children: ReactNode }) {
  const [stone, setStone] = useState<Stone[]>([]);

  const handlerEnterStone = (
    name: string,
    className: string,
    subClassName?: string,
    extraClass?: string
  ) => {
    console.log("handlerEnterStone", name, className, subClassName, extraClass);
    setStone((prev) => {
      if (name === "" && className !== "" && subClassName === ""&& extraClass === "") {
        return [
          ...prev,
          { tag: "div", className: className, subClassName: "" , extraClass: ""},
        ];
      }
      if (name !== "" && className === "" && subClassName === "" && extraClass === "") {
        return [...prev, { tag: name, className: "", subClassName: "" , extraClass: ""}];
      }
      if (name !== "" && className !== "" && subClassName === "") {
        return [...prev, { tag: name, className: className, subClassName: "", extraClass: "" }];
      }
      if (subClassName !== "") {
        return [
          ...prev,
          {
            tag: name,
            className: className,
            subClassName: subClassName,
            extraClass: extraClass,
          },
        ];
      }
      if (extraClass !== "") {
        return [
          ...prev,
          {
            tag: name,
            className: className,
            subClassName: subClassName,
            extraClass: extraClass,
          },
        ];
      }
      // if (name !== "") {
      //   return [...prev, { tag: "div", className: className }];
      // }
      // if (name === "class" && prev.length === 0) {
      //   return [...prev, { tag: "div", className: className }];
      // }
      // if (name === "class" && prev.length > 0) {
      //   const updated = [...prev];
      //   updated[updated.length - 1] = {
      //     ...updated[updated.length - 1],
      //     className: input,
      //   };
      //   return updated;
      // }
      return prev;
    });
  };

  return (
    <StateContext.Provider
      value={{
        stone,
        setStone,
        handlerEnterStone,
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
