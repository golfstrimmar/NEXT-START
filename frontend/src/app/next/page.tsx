"use client";
import React, { useState, useRef, useEffect } from "react";
import styles from "./next.module.scss";
import { TrashIcon } from "@heroicons/react/24/outline";
// Тип для элементов dashItems
interface DashItem {
  name: string;
  value: string[];
}

const NextPage = () => {
  const [value, setValue] = useState<string[]>([]);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [delButton, setDelButton] = useState<boolean>(false);
  const [actItem, setActItem] = useState<string>("");
  const [dashItems, setDashItems] = useState<string>("");

  // const dashItems: DashItem[] = [
  //   {
  //     name: "useRouter",
  //     value: [
  //       `import { useRouter } from "next/navigation";`,
  //       `-------------------------------`,
  //       `const router = useRouter();`,
  //       `-------------------------------`,
  //       ` router.push("/");`,
  //     ],
  //   },
  // ];

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch("/api/notes");
        const data: NotesResponse = await response.json();
        if (data.notes) {
          setDashItems(data.notes);
        }
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    };
    fetchNotes();
  }, []);
  useEffect(() => {
    if (dashItems.length > 0) {
      console.log("<====dashItems====>", dashItems);
    }
  }, [dashItems]);
  useEffect(() => {
    if (actItem?.length > 0) {
      console.log("<====actItem====>", actItem);
    }
  }, [actItem]);
  return (
    <div className="grid grid-cols-[30%_60%] px-2 ">
      <div className={styles.sidebar}>
        <div className="flex justify-end items-center border border-slate-400">
          <button
            type="button"
            onClick={() => {
              setValue([]);
              setDelButton(true);
              setActItem("");
              setTimeout(() => {
                setDelButton(false);
              }, 200);
            }}
            className={`p-1 flex justify-center bg-red-100 transition-all duration-200 ${
              delButton ? "bg-red-300" : "bg-red-100"
            }`}
          >
            <TrashIcon className="w-5 h-5 text-red-500" />
          </button>
        </div>
        {/* ${actItem === item._id ? "bg-slate-100" : "bg-slate-0"} */}
        <div className="flex flex-col ">
          {dashItems?.length > 0 &&
            dashItems?.map((item, index) => (
              <button
                key={index}
                type="button"
                className={`p-1 border border-slate-400  transition-all duration-200 
                ${
                  actItem === item.id
                    ? "bg-slate-500 text-white"
                    : "bg-slate-0 hover:bg-slate-100"
                }
                `}
                onClick={(e) => {
                  setValue((prev: string[]) => {
                    return actItem === item.id ? [] : [...item?.value];
                  });
                  setActItem((prev) => {
                    return actItem !== item.id ? item.id : null;
                  });
                }}
              >
                {item.name}
              </button>
            ))}
        </div>
      </div>
      <div
        className={`outline-4  ${
          isCopied ? "outline-emerald-400 bg-emerald-100" : "outline-slate-400"
        }`}
        onClick={() => {
          navigator.clipboard.writeText(value.join("\n"));
          setIsCopied(true);
          setTimeout(() => {
            setIsCopied(false);
          }, 200);
        }}
      >
        {value.length > 0 && (
          <pre
            className={` p-2 rounded ${
              isCopied ? " bg-emerald-100" : "bg-gray-100"
            }`}
          >
            <code>{value.join("\n")}</code>
          </pre>
        )}
      </div>
    </div>
  );
};

export default NextPage;
