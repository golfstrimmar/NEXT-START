"use client";
import React, { useState, useRef, useEffect } from "react";
import styles from "./next.module.scss";
import { TrashIcon } from "@heroicons/react/24/outline";
import FormNote from "@/components/FormAddNote/FormAddNote";
import Image from "next/image";
import Button from "@/components/ui/Button/Button";
import ModalMessage from "@/components/ModalMessage/ModalMessage";
import ButtonTab from "@/components/ButtonTab";
import Tabs from "@/components/ui/Tabs/Tabs";
interface DashItem {
  id: string;
  name: string;
  value: string[];
  category: string;
}

interface NotesResponse {
  notes: DashItem[];
}

const NextPage = () => {
  const [value, setValue] = useState<string[]>([]);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [delButton, setDelButton] = useState<boolean>(false);
  const [actItem, setActItem] = useState<string>("");
  const [dashItems, setDashItems] = useState<DashItem[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [ItemToEdit, setItemToEdit] = useState<DashItem>({
    id: "",
    name: "",
    value: [],
    category: "",
  });
  const [onEdit, setOnEdit] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (dashItems?.length > 0) {
      const uniqueCategories = Array.from(
        new Set(
          dashItems.map((item) => item.category).filter((category) => category)
        )
      );

      setCategories(uniqueCategories);
    }
  }, [dashItems]);

  useEffect(() => {
    if (categories) {
      console.log("<==== categories====>", categories);
    }
  }, [categories]);

  const fetchNotes = async () => {
    try {
      const response = await fetch("/api/notes");
      const data: NotesResponse = await response.json();
      if (data.notes) {
        setDashItems(data.notes);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
      setError("Ошибка при загрузке заметок");
      setShowModal(true);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    if (dashItems) {
      console.log("<==== dashItems====>", dashItems);
    }
  }, [dashItems]);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      e.stopPropagation();
      if (
        e.target instanceof Node &&
        !e.target.closest(".button-tab") &&
        !e.target.closest(".next-hidden")
      ) {
        refs.current.forEach((btn) => {
          if (btn && btn.classList.contains("run")) {
            btn.classList.remove("run");
          }
        });
      }
    };

    // Добавляем обработчик события на документ
    document.addEventListener("click", handleClickOutside);

    // Убираем обработчик при размонтировании компонента
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);
  const holderDelite = async (id: string) => {
    try {
      const response = await fetch("/api/notes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Не удалось удалить заметку");
      }

      const result = await response.json();
      setMessage(result.message);
      setShowModal(true);

      // Сбрасываем выбранную заметку
      setValue([]);
      setActItem("");

      // Перезагружаем список заметок
      await fetchNotes();

      setTimeout(() => {
        setShowModal(false);
        setMessage("");
      }, 1500);
    } catch (error) {
      console.error("Error deleting note:", error);
      setError(error.message || "Произошла ошибка при удалении");
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        setError("");
      }, 1500);
    }
  };

  return (
    <div>
      {message && <ModalMessage message={message} open={showModal} />}
      {error && <ModalMessage message={error} open={showModal} />}
      <div className="my-2">
        <Button
          onClick={() => {
            setOnEdit(false);
            setItemToEdit({ id: "", name: "", value: [], category: "" });
            setIsOpen((prev) => !prev);
          }}
        >
          Form Add or Update Note
        </Button>
      </div>
      {isOpen && (
        <FormNote
          initialData={ItemToEdit}
          onEdit={onEdit}
          onSuccess={() => {
            setIsOpen((prev) => !prev);
            setOnEdit(false);
            setItemToEdit({ id: "", name: "", value: [], category: "" });
            fetchNotes();
          }}
        />
      )}
      <div className="grid grid-cols-[30%_1fr] w-full  my-8">
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
          <div className="flex flex-col wrap gap-2 mt-2">
            {categories?.length > 0 &&
              categories.map((category, index) => (
                <div key={index} className="border border-slate-400 ">
                  <ButtonTab refs={refs} name={category} />
                  <div className="next-hidden ">
                    <div className="next-hidden__wrap pl-2">
                      {/* {category} */}
                      {dashItems
                        ?.filter((item) => item.category === category)
                        .map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            className={`p-1 w-full   border border-slate-400  transition-all duration-200  flex justify-between items-center 
                ${
                  actItem === item.id
                    ? "bg-slate-500 hover:bg-slate-600 text-white"
                    : "bg-slate-200 hover:bg-slate-300"
                }
                `}
                            onClick={(e) => {
                              e.stopPropagation();
                              setValue((prev: string[]) => {
                                return actItem === item.id
                                  ? []
                                  : [...item?.value];
                              });
                              setActItem((prev) => {
                                return actItem !== item.id ? item.id : "";
                              });
                            }}
                          >
                            {item.name}
                            <Image
                              src="/assets/svg/edit.svg"
                              alt="arrow"
                              width={25}
                              height={25}
                              className="fill-slate-500 border-cyan-600 border-2 rounded-full ml-auto"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen((prev) => !prev);
                                setItemToEdit(item);
                                setOnEdit(true);
                              }}
                            />
                            <Image
                              src="/assets/svg/cross.svg"
                              alt="arrow"
                              width={25}
                              height={25}
                              className="fill-slate-500 border-cyan-600 border-2 rounded-full "
                              onClick={(e) => {
                                e.stopPropagation();
                                holderDelite(item?.id);
                              }}
                            />
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div
          className={`outline-4  ${
            isCopied
              ? "outline-emerald-400 bg-emerald-100"
              : "outline-slate-400"
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
              className={` p-2 rounded w-full overflow-x-auto whitespace-pre-wrap break-words ${
                isCopied ? " bg-emerald-100" : "bg-gray-100"
              }`}
            >
              <code>{value.join("\n")}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default NextPage;
