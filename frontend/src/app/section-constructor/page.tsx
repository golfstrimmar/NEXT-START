"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useStateContext } from "@/components/StateProvider";
import { useRouter } from "next/navigation";
import TagTree from "@/components/TagTree/TagTree";
import htmlToScss from "@/app/utils/htmlToScss";
import htmlToPug from "@/app/utils/htmlToPug";

interface Item {
  id: number;
  value: string;
  children: string[];
}

const templates = {
  best: {
    availableElements: {
      img: {
        id: 3,
        value:
          '<div class="best__img rel"><div class="imgs"><img src="" alt=""></div></div>',
        parentId: 2,
        order: 1,
      },
      svg: {
        id: 5,
        value: '<svg><use xlink:href="#flag"></use></svg>',
        parentId: 4,
        order: 1,
      },
      h2: {
        id: 6,
        value: "<h2></h2>",
        parentId: 4,
        order: 2,
      },
      h3: {
        id: 7,
        value: "<h3></h3>",
        parentId: 4,
        order: 3,
      },
      p: {
        id: 8,
        value: '<p class="best__text"></p>',
        parentId: 4,
        order: 4,
      },
      span: {
        id: 9,
        value: "<span></span>",
        parentId: 4,
        order: 5,
      },
      link: {
        id: 10,
        value: '<a class="best__link" href="#"></a>',
        parentId: 4,
        order: 6,
      },
      button1: {
        id: 11,
        value:
          '<button class="btn btn-success but-wave" href="#!" type="button"></button>',
        parentId: 4,
        order: 7,
      },
      button2: {
        id: 12,
        value: '<button class="btn btn-blue" href="#!" type="button"></button>',
        parentId: 4,
        order: 8,
      },
    },
    base: [
      { id: 0, value: '<div class="best"></div>', children: ["1"] },
      { id: 1, value: '<div class="container"></div>', children: ["2"] },
      { id: 2, value: '<div class="best__wrap"></div>', children: ["4"] },
      { id: 4, value: '<div class="best__content"></div>', children: [] },
    ],
  },
  cards: {
    availableElements: {
      svg: {
        id: 20,
        value: '<svg><use xlink:href="#flag"></use></svg>',
        parentId: 4,
        order: 1,
      },
      decor: {
        id: 21,
        value: '<div class="card__decor"></div>',
        parentId: 4,
        order: 2,
      },
      bage: {
        id: 22,
        value: '<div class="card__bage"></div>',
        parentId: 4,
        order: 3,
      },
      img: {
        id: 23,
        value:
          '<div class="card__img rel"><div class="imgs"><img src="" alt=""></div></div>',
        parentId: 4,
        order: 4,
      },
      h3: {
        id: 24,
        value: "<h3></h3>",
        parentId: 4,
        order: 5,
      },
      p: {
        id: 25,
        value: "<p></p>",
        parentId: 4,
        order: 6,
      },
      span: {
        id: 26,
        value: "<span></span>",
        parentId: 4,
        order: 7,
      },
      button: {
        id: 27,
        value:
          '<button type="button" class="btn btn-success but-wave" name="text"></button>',
        parentId: 4,
        order: 8,
      },
    },
    base: [
      { id: 0, value: '<ul class="best__cards"></ul>', children: ["1"] },
      { id: 1, value: "<li></li>", children: ["2"] },
      { id: 2, value: '<div class="best__card card"></div>', children: ["3"] },
      { id: 3, value: '<div class="card__wrap"></div>', children: ["4"] },
      { id: 4, value: '<div class="card__content"></div>', children: [] },
    ],
  },
};

const Constructor = () => {
  const [baseBest, setBaseBest] = useState<Item[]>(templates.best.base);
  const [baseCards, setBaseCards] = useState<Item[]>(templates.cards.base);
  const [resultBest, setResultBest] = useState<string>("");
  const [resultCards, setResultCards] = useState<string>("");
  const router = useRouter();
  const { handlerSetTags } = useStateContext();
  const CopyPugBest = useRef<HTMLButtonElement>(null);
  const CopyScssBest = useRef<HTMLButtonElement>(null);
  const CopyHtmlBest = useRef<HTMLDivElement>(null);
  const CopyPugCards = useRef<HTMLButtonElement>(null);
  const CopyScssCards = useRef<HTMLButtonElement>(null);
  const CopyHtmlCards = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("<====baseBest====>", baseBest);
    console.log("<====baseCards====>", baseCards);
  }, [baseBest, baseCards]);

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

  const handleAddElement = (
    templateKey: "best" | "cards",
    elementKey: string
  ) => {
    const setBase = templateKey === "best" ? setBaseBest : setBaseCards;
    const base = templateKey === "best" ? baseBest : baseCards;

    setBase((prev) => {
      const element = templates[templateKey].availableElements[elementKey];
      const hasElement = prev.some((item) => item.id === element.id);
      let updatedBase = [...prev];

      if (hasElement) {
        updatedBase = updatedBase.filter((item) => item.id !== element.id);
        updatedBase = updatedBase.map((item) => ({
          ...item,
          children: item.children.filter(
            (childId) => childId !== element.id.toString()
          ),
        }));
      } else {
        updatedBase.push({
          id: element.id,
          value: element.value,
          children: [],
        });
      }

      updatedBase = updatedBase.map((item) => {
        if (item.id === element.parentId) {
          const siblings = Object.values(
            templates[templateKey].availableElements
          )
            .filter((el) => el.parentId === item.id)
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

  const handlerResult = (
    templateKey: "best" | "cards",
    result: string,
    ref: React.RefObject<HTMLElement>
  ) => {
    navigator.clipboard.writeText(result);
    if (ref.current) {
      ref.current.style.boxShadow = "0 0 10px red";
      setTimeout(() => {
        if (ref.current) {
          ref.current.style.boxShadow = "0 0 3px 0 gray";
        }
      }, 300);
    }
    handlerSetTags([result]);
    // router.push("/");
  };

  const handlerScss = (result: string) => {
    const scssOutput = htmlToScss(result);
    return scssOutput.scss;
  };

  const handlerPug = (result: string) => {
    const pugOutput = htmlToPug(result);
    return pugOutput;
  };

  return (
    <div>
      <div className="flex flex-col gap-4">
        {/* Best Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4"> Section</h2>
          <div className="flex gap-4 mb-2">
            <button
              onClick={() => {
                setResultBest(renderBaseToString(baseBest));
              }}
              className="bg-lime-400 w-200 h-10 border border-slate-800 flex justify-center items-center rounded-2xl"
              title="Рендерить и показать результат (Best)"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
            <button
              className="bg-red-400 w-50 h-10 border border-slate-800 flex justify-center items-center rounded-2xl"
              onClick={() => {
                setResultBest("");
                setBaseBest(templates.best.base);
              }}
              title="Сбросить все элементы (Best)"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-[1fr_40%] gap-2">
            <div className="bg-slate-200 grid grid-cols-[160px_1fr]">
              <button
                type="button"
                className={`bg-slate-400 w-40 h-40 border border-slate-800 flex justify-center items-center relative ${
                  baseBest.some(
                    (item) =>
                      item.id === templates.best.availableElements.img.id
                  )
                    ? "opacity-100 bg-green-200"
                    : "opacity-40"
                }`}
                onClick={() => handleAddElement("best", "img")}
                title="Добавить или убрать img"
              >
                <div className="imgs">
                  <Image
                    src="/assets/images/18.jpg"
                    alt="18"
                    width={160}
                    height={160}
                  />
                </div>
              </button>
              <div className="flex flex-col">
                <button
                  type="button"
                  className={`bg-slate-400 w-40 border border-slate-800 flex justify-center items-center relative ${
                    baseBest.some(
                      (item) =>
                        item.id === templates.best.availableElements.svg.id
                    )
                      ? "opacity-100 bg-green-200"
                      : "opacity-40"
                  }`}
                  onClick={() => handleAddElement("best", "svg")}
                  title="Добавить или убрать svg"
                >
                  <Image
                    src="/globe.svg"
                    alt="globe"
                    width={50}
                    height={40}
                    className="fill-blue-500"
                  />
                </button>
                <button
                  type="button"
                  className={`bg-slate-400 w-40 border border-slate-800 flex justify-center items-center relative ${
                    baseBest.some(
                      (item) =>
                        item.id === templates.best.availableElements.h2.id
                    )
                      ? "opacity-100 bg-green-200"
                      : "opacity-40"
                  }`}
                  onClick={() => handleAddElement("best", "h2")}
                  title="Добавить или убрать h2"
                >
                  h2
                </button>
                <button
                  type="button"
                  className={`bg-slate-400 w-40 border border-slate-800 flex justify-center items-center relative ${
                    baseBest.some(
                      (item) =>
                        item.id === templates.best.availableElements.h3.id
                    )
                      ? "opacity-100 bg-green-200"
                      : "opacity-40"
                  }`}
                  onClick={() => handleAddElement("best", "h3")}
                  title="Добавить или убрать h3"
                >
                  h3
                </button>
                <button
                  type="button"
                  className={`bg-slate-400 w-40 border border-slate-800 flex justify-center items-center relative ${
                    baseBest.some(
                      (item) =>
                        item.id === templates.best.availableElements.p.id
                    )
                      ? "opacity-100 bg-green-200"
                      : "opacity-40"
                  }`}
                  onClick={() => handleAddElement("best", "p")}
                  title="Добавить или убрать p"
                >
                  p
                </button>
                <button
                  type="button"
                  className={`bg-slate-400 w-40 border border-slate-800 flex justify-center items-center relative ${
                    baseBest.some(
                      (item) =>
                        item.id === templates.best.availableElements.span.id
                    )
                      ? "opacity-100 bg-green-200"
                      : "opacity-40"
                  }`}
                  onClick={() => handleAddElement("best", "span")}
                  title="Добавить или убрать span"
                >
                  span
                </button>
                <button
                  type="button"
                  className={`bg-slate-400 w-40 border border-slate-800 flex justify-center items-center relative ${
                    baseBest.some(
                      (item) =>
                        item.id === templates.best.availableElements.link.id
                    )
                      ? "opacity-100 bg-green-200"
                      : "opacity-40"
                  }`}
                  onClick={() => handleAddElement("best", "link")}
                  title="Добавить или убрать link"
                >
                  a
                </button>
                <button
                  type="button"
                  className={`bg-slate-400 w-40 border border-slate-800 flex justify-center items-center relative ${
                    baseBest.some(
                      (item) =>
                        item.id === templates.best.availableElements.button1.id
                    )
                      ? "opacity-100 bg-green-200"
                      : "opacity-40"
                  }`}
                  onClick={() => handleAddElement("best", "button1")}
                  title="Добавить или убрать button1"
                >
                  button-success
                </button>
                <button
                  type="button"
                  className={`bg-slate-400 w-40 border border-slate-800 flex justify-center items-center relative ${
                    baseBest.some(
                      (item) =>
                        item.id === templates.best.availableElements.button2.id
                    )
                      ? "opacity-100 bg-green-200"
                      : "opacity-40"
                  }`}
                  onClick={() => handleAddElement("best", "button2")}
                  title="Добавить или убрать button2"
                >
                  button-blue
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div
                  ref={CopyHtmlBest}
                  className="rounded-full shadow hover:shadow-red-800 transition-all duration-200 ease-in-out"
                  onClick={() => {
                    handlerResult("best", resultBest, CopyHtmlBest);
                  }}
                >
                  <Image
                    src="https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original-wordmark.svg"
                    alt="html"
                    width={30}
                    height={30}
                    className="p-1"
                  />
                </div>
                <button
                  ref={CopyPugBest}
                  type="button"
                  onClick={() => {
                    if (CopyPugBest.current) {
                      CopyPugBest.current.style.boxShadow = "0 0 10px blue";
                      setTimeout(() => {
                        if (CopyPugBest.current) {
                          CopyPugBest.current.style.boxShadow = "none";
                        }
                      }, 300);
                    }
                    navigator.clipboard.writeText(handlerPug(resultBest));
                  }}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center leading-none text-[14px] cursor-pointer hover:bg-purple-600 transition-all duration-200 ease-in-out overflow-hidden"
                >
                  <Image src="/pug.svg" alt="pug" width={30} height={30} />
                </button>
                <button
                  ref={CopyScssBest}
                  type="button"
                  onClick={() => {
                    if (CopyScssBest.current) {
                      CopyScssBest.current.style.boxShadow = "0 0 10px red";
                      setTimeout(() => {
                        if (CopyScssBest.current) {
                          CopyScssBest.current.style.boxShadow = "none";
                        }
                      }, 300);
                    }
                    navigator.clipboard.writeText(handlerScss(resultBest));
                  }}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center leading-none text-[14px] cursor-pointer hover:bg-red-600 transition-all duration-200 ease-in-out overflow-hidden"
                >
                  <Image
                    src="https://raw.githubusercontent.com/devicons/devicon/master/icons/sass/sass-original.svg"
                    alt="sass"
                    width={25}
                    height={25}
                  />
                </button>
              </div>
              <div
                className="border-slate-800 border p-4"
                title="Кликните, чтобы скопировать результат и вернуться на главную"
              >
                <TagTree tags={[resultBest]} />
              </div>
            </div>
          </div>
        </div>

        {/* Separator */}
        <hr className="my-4 border-slate-400" />

        {/* Cards Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Cards</h2>
          <div className="flex gap-4 mb-2">
            <button
              onClick={() => {
                setResultCards(renderBaseToString(baseCards));
              }}
              className="bg-lime-400 w-200 h-10 border border-slate-800 flex justify-center items-center rounded-2xl"
              title="Рендерить и показать результат (Cards)"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
            <button
              className="bg-red-400 w-50 h-10 border border-slate-800 flex justify-center items-center rounded-2xl"
              onClick={() => {
                setResultCards("");
                setBaseCards(templates.cards.base);
              }}
              title="Сбросить все элементы (Cards)"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-[1fr_40%] gap-2">
            <div className="bg-slate-200 grid grid-cols-[160px_1fr]">
              <button
                type="button"
                className={`bg-slate-400 w-40 h-40 border border-slate-800 flex justify-center items-center relative ${
                  baseCards.some(
                    (item) =>
                      item.id === templates.cards.availableElements.img.id
                  )
                    ? "opacity-100 bg-green-200"
                    : "opacity-40"
                }`}
                onClick={() => handleAddElement("cards", "img")}
                title="Добавить или убрать img"
              >
                <div className="imgs">
                  <Image
                    src="/assets/images/18.jpg"
                    alt="18"
                    width={160}
                    height={160}
                  />
                </div>
              </button>
              <div className="flex flex-col">
                <button
                  type="button"
                  className={`bg-slate-400 w-40 border border-slate-800 flex justify-center items-center relative ${
                    baseCards.some(
                      (item) =>
                        item.id === templates.cards.availableElements.svg.id
                    )
                      ? "opacity-100 bg-green-200"
                      : "opacity-40"
                  }`}
                  onClick={() => handleAddElement("cards", "svg")}
                  title="Добавить или убрать svg"
                >
                  <Image
                    src="/globe.svg"
                    alt="globe"
                    width={50}
                    height={40}
                    className="fill-blue-500"
                  />
                </button>
                <button
                  type="button"
                  className={`bg-slate-400 w-40 border border-slate-800 flex justify-center items-center relative ${
                    baseCards.some(
                      (item) =>
                        item.id === templates.cards.availableElements.decor.id
                    )
                      ? "opacity-100 bg-green-200"
                      : "opacity-40"
                  }`}
                  onClick={() => handleAddElement("cards", "decor")}
                  title="Добавить или убрать decor"
                >
                  decor
                </button>
                <button
                  type="button"
                  className={`bg-slate-400 w-40 border border-slate-800 flex justify-center items-center relative ${
                    baseCards.some(
                      (item) =>
                        item.id === templates.cards.availableElements.bage.id
                    )
                      ? "opacity-100 bg-green-200"
                      : "opacity-40"
                  }`}
                  onClick={() => handleAddElement("cards", "bage")}
                  title="Добавить или убрать bage"
                >
                  bage
                </button>
                <button
                  type="button"
                  className={`bg-slate-400 w-40 border border-slate-800 flex justify-center items-center relative ${
                    baseCards.some(
                      (item) =>
                        item.id === templates.cards.availableElements.h3.id
                    )
                      ? "opacity-100 bg-green-200"
                      : "opacity-40"
                  }`}
                  onClick={() => handleAddElement("cards", "h3")}
                  title="Добавить или убрать h3"
                >
                  h3
                </button>
                <button
                  type="button"
                  className={`bg-slate-400 w-40 border border-slate-800 flex justify-center items-center relative ${
                    baseCards.some(
                      (item) =>
                        item.id === templates.cards.availableElements.p.id
                    )
                      ? "opacity-100 bg-green-200"
                      : "opacity-40"
                  }`}
                  onClick={() => handleAddElement("cards", "p")}
                  title="Добавить или убрать p"
                >
                  p
                </button>
                <button
                  type="button"
                  className={`bg-slate-400 w-40 border border-slate-800 flex justify-center items-center relative ${
                    baseCards.some(
                      (item) =>
                        item.id === templates.cards.availableElements.span.id
                    )
                      ? "opacity-100 bg-green-200"
                      : "opacity-40"
                  }`}
                  onClick={() => handleAddElement("cards", "span")}
                  title="Добавить или убрать span"
                >
                  span
                </button>
                <button
                  type="button"
                  className={`bg-slate-400 w-40 border border-slate-800 flex justify-center items-center relative ${
                    baseCards.some(
                      (item) =>
                        item.id === templates.cards.availableElements.button.id
                    )
                      ? "opacity-100 bg-green-200"
                      : "opacity-40"
                  }`}
                  onClick={() => handleAddElement("cards", "button")}
                  title="Добавить или убрать button"
                >
                  button-success
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div
                  ref={CopyHtmlCards}
                  className="rounded-full shadow hover:shadow-red-800 transition-all duration-200 ease-in-out"
                  onClick={() => {
                    handlerResult("cards", resultCards, CopyHtmlCards);
                  }}
                >
                  <Image
                    src="https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original-wordmark.svg"
                    alt="html"
                    width={30}
                    height={30}
                    className="p-1"
                  />
                </div>
                <button
                  ref={CopyPugCards}
                  type="button"
                  onClick={() => {
                    if (CopyPugCards.current) {
                      CopyPugCards.current.style.boxShadow = "0 0 10px blue";
                      setTimeout(() => {
                        if (CopyPugCards.current) {
                          CopyPugCards.current.style.boxShadow = "none";
                        }
                      }, 300);
                    }
                    navigator.clipboard.writeText(handlerPug(resultCards));
                  }}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center leading-none text-[14px] cursor-pointer hover:bg-purple-600 transition-all duration-200 ease-in-out overflow-hidden"
                >
                  <Image src="/pug.svg" alt="pug" width={30} height={30} />
                </button>
                <button
                  ref={CopyScssCards}
                  type="button"
                  onClick={() => {
                    if (CopyScssCards.current) {
                      CopyScssCards.current.style.boxShadow = "0 0 10px red";
                      setTimeout(() => {
                        if (CopyScssCards.current) {
                          CopyScssCards.current.style.boxShadow = "none";
                        }
                      }, 300);
                    }
                    navigator.clipboard.writeText(handlerScss(resultCards));
                  }}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center leading-none text-[14px] cursor-pointer hover:bg-red-600 transition-all duration-200 ease-in-out overflow-hidden"
                >
                  <Image
                    src="https://raw.githubusercontent.com/devicons/devicon/master/icons/sass/sass-original.svg"
                    alt="sass"
                    width={25}
                    height={25}
                  />
                </button>
              </div>
              <div
                className="border-slate-800 border p-4"
                title="Кликните, чтобы скопировать результат и вернуться на главную"
              >
                <TagTree tags={[resultCards]} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Constructor;
