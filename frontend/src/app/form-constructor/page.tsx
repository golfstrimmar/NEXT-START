"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import Globe from "../../../public/globe.svg"; // Заменить на твой SVG для Star или chevron-down, если нужно
import { useStateContext } from "@/components/StateProvider";
import { useRouter } from "next/navigation";
import TagTree from "@/components/TagTree/TagTree";

interface Item {
  id: number;
  value: string;
  children: string[];
}

// Определяем доступные элементы с порядком
const availableElements: Record<
  string,
  {
    id: number;
    value: string;
    children?: string[];
    parentId: number;
    order: number;
  }
> = {
  inputName: {
    id: 1,
    value:
      '<div class="send__linia input-field text-field"><input id="firstname" type="text" name="name" value="" placeholder="Denzel Washington"><label class="text-field__label" for="name"></label><span></span></div>',
    parentId: 0, // Внутри form
    order: 1,
  },
  inputEmail: {
    id: 2,
    value:
      '<div class="send__linia input-field text-field"><input id="email" type="email" name="email" value="" placeholder="Denzel Washington"><label class="text-field__label" for="email"></label><span></span></div>',
    parentId: 0, // Внутри form
    order: 2,
  },
  inputTel: {
    id: 3,
    value:
      '<div class="send__linia input-field text-field"><input id="tel" type="tel" name="tel" value="" placeholder="Denzel Washington"><label class="text-field__label" for="tel"></label><span></span></div>',
    parentId: 0, // Внутри form
    order: 3,
  },
  textarea: {
    id: 4,
    value:
      '<div class="send__linia textarea-field text-field"><textarea id="textarea4" name="textarea4" row="20" placeholder="Введите текст"></textarea><label for="textarea4"></label></div>',
    parentId: 0, // Внутри form
    order: 4,
  },
  rating: {
    id: 5,
    value:
      '<div class="send__linia"><p></p><fieldset class="fildset-rating"><div class="fildset-rating__items"><input type="radio" id="ratingForm5" name="ratingForm" value="5"><label for="ratingForm5"><svg><use xlink:href="#Star"></use></svg></label><input type="radio" id="ratingForm4" name="ratingForm" value="4"><label for="ratingForm4"><svg><use xlink:href="#Star"></use></svg></label><input type="radio" id="ratingForm3" name="ratingForm" value="3"><label for="ratingForm3"><svg><use xlink:href="#Star"></use></svg></label><input type="radio" id="ratingForm2" name="ratingForm" value="2"><label for="ratingForm2"><svg><use xlink:href="#Star"></use></svg></label><input type="radio" id="ratingForm1" name="ratingForm" value="1"><label for="ratingForm1"><svg><use xlink:href="#Star"></use></svg></label></div></fieldset></div>',
    parentId: 0, // Внутри form
    order: 5,
  },
  select: {
    id: 6,
    value:
      '<div class="send__linia select" id="wal"><button class="dropdown-button"><span></span><input type="hidden" name="place"><svg class="icon"><use xlink:href="#chevron-down"></use></svg></button><ul class="dropdown-list"><li class="dropdown-list__item" data-value="Notes"></li><li class="dropdown-list__item" data-value="Photo"></li><li class="dropdown-list__item" data-value="Dictionary"></li></ul></div>',
    parentId: 0, // Внутри form
    order: 6,
  },
  checkbox: {
    id: 7,
    value:
      '<div class="fildset-checkbox"><div class="form-check"><input id="agree" type="checkbox" name="agree"><label for="agree"></label></div></div>',
    parentId: 0, // Внутри form
    order: 7,
  },
  submitButton: {
    id: 8,
    value:
      '<p class="but-wave"><button class="btn btn-success" type="submit"></button></p>',
    parentId: 0, // Внутри form
    order: 8,
  },
};

const Constructor = () => {
  const [result, setResult] = useState<string>("");
  const [base, setBase] = useState<Item[]>([
    {
      id: 0,
      value:
        '<form class="send send-form" id="send-form" action="#" method="post" name="send-form"></form>',
      children: [],
    },
  ]);
  const router = useRouter();
  const { handlerSetTags } = useStateContext();

  useEffect(() => {
    console.log("<====base====>", base);
  }, [base]);

  const renderBaseToString = (base: Item[]): string => {
    const itemMap = new Map<number, Item>(base.map((item) => [item.id, item]));

    const renderItem = (item: Item): string => {
      const isCompleteTag = item.value.match(/<([a-z0-9]+)([^>]*)>.*<\/\1>/is);

      if (isCompleteTag) {
        const childrenContent = item.children
          .map((childId) => {
            const childItem = itemMap.get(Number(childId));
            return childItem ? renderItem(childItem) : "";
          })
          .join("");

        const closingTagStart = item.value.lastIndexOf("</");

        if (closingTagStart !== -1) {
          return (
            item.value.slice(0, closingTagStart) +
            childrenContent +
            item.value.slice(closingTagStart)
          );
        }
        return item.value + childrenContent;
      }

      const childrenContent = item.children
        .map((childId) => {
          const childItem = itemMap.get(Number(childId));
          return childItem ? renderItem(childItem) : "";
        })
        .join("");

      return item.value + childrenContent;
    };

    const rootItems = base.filter(
      (item) =>
        !base.some((other) => other.children.includes(item.id.toString()))
    );

    return rootItems.map((item) => renderItem(item)).join("");
  };

  const handleAddElement = (elementKey: string) => {
    setBase((prev) => {
      const element = availableElements[elementKey];
      const hasElement = prev.some((item) => item.id === element.id);
      let updatedBase = [...prev];

      if (hasElement) {
        // Удаляем элемент и его id из children родителя
        updatedBase = updatedBase.filter((item) => item.id !== element.id);
        updatedBase = updatedBase.map((item) => ({
          ...item,
          children: item.children.filter(
            (childId) => childId !== element.id.toString()
          ),
        }));
      } else {
        // Добавляем новый элемент
        updatedBase.push({
          id: element.id,
          value: element.value,
          children: [],
        });
      }

      // Обновляем children родителя с учётом порядка
      updatedBase = updatedBase.map((item) => {
        if (item.id === element.parentId) {
          const siblings = Object.values(availableElements)
            .filter((el) => el.parentId === element.parentId)
            .sort((a, b) => a.order - b.order)
            .map((el) => el.id.toString());
          const newChildren = siblings.filter((id) =>
            updatedBase.some((item) => item.id.toString() === id)
          );
          return { ...item, children: newChildren };
        }
        return item;
      });

      return updatedBase;
    });
  };

  const handlerResult = () => {
    navigator.clipboard.writeText(result);
    handlerSetTags([result]);
    router.push("/");
  };

  return (
    <div>
      <div className="flex gap-4 mb-2">
        <button
          onClick={() => {
            setResult(renderBaseToString(base));
          }}
          className="bg-lime-400 w-200 h-10 border border-slate-800 flex justify-center items-center rounded-2xl"
          title="Рендерить и показать результат"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
        <button
          className="bg-red-400 w-50 h-10 border border-slate-800 flex justify-center items-center rounded-2xl"
          onClick={() => {
            setResult("");
            setBase([
              {
                id: 0,
                value:
                  '<form class="send send-form" id="send-form" action="#" method="post" name="send-form"></form>',
                children: [],
              },
            ]);
          }}
          title="Сбросить все элементы"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-[1fr_20%_20%]">
        <div className="bg-slate-200 grid grid-cols-[160px_1fr]">
          {Object.entries(availableElements).map(([key, element]) => (
            <button
              key={key}
              type="button"
              className={`bg-slate-400 w-40 h-40 border border-slate-800 flex justify-center items-center relative ${
                base.some((item) => item.id === element.id)
                  ? "opacity-100 bg-green-200"
                  : "opacity-40"
              }`}
              onClick={() => handleAddElement(key)}
              title={`Добавить или убрать ${key}`}
            >
              {key === "rating" ? (
                <Globe width={50} height={50} className="fill-blue-500" /> // Заменить на SVG Star, если есть
              ) : key === "select" ? (
                <Globe width={50} height={50} className="fill-blue-500" /> // Заменить на SVG chevron-down, если есть
              ) : (
                key
              )}
            </button>
          ))}
        </div>
        <div
          className="border-slate-800 border p-4"
          onClick={() => {
            handlerResult();
          }}
          title="Кликните, чтобы скопировать результат и вернуться на главную"
        >
          <TagTree tags={[result]} />
          {/* <pre>{result}</pre> */}
        </div>
      </div>
    </div>
  );
};

export default Constructor;
