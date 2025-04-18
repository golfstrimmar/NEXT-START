"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import Globe from "../../../public/globe.svg";
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
  img: {
    id: 2,
    value:
      '<div class="best__img rel"><div class="imgs"><img src="" alt=""></div></div>',
    parentId: 1, // Внутри best__wrap
    order: 1,
  },
  svg: {
    id: 4,
    value: '<svg><use xlink:href="#flag"></use></svg>',
    parentId: 3, // Внутри best__content
    order: 1,
  },
  h2: {
    id: 5,
    value: "<h2></h2>",
    parentId: 3, // Внутри best__content
    order: 2,
  },
  h3: {
    id: 6,
    value: "<h3></h3>",
    parentId: 3, // Внутри best__content
    order: 3,
  },
  p: {
    id: 7,
    value: '<p class="best__text"></p>',
    parentId: 3, // Внутри best__content
    order: 4,
  },
  span: {
    id: 8,
    value: "<span></span>",
    parentId: 3, // Внутри best__content
    order: 5,
  },
  link: {
    id: 9,
    value: '<a class="best__link" href="#"></a>',
    parentId: 3, // Внутри best__content
    order: 6,
  },
  button1: {
    id: 10,
    value:
      '<button class="btn btn-success but-wave" href="#!" type="button"></button>',
    parentId: 3, // Внутри best__content
    order: 7,
  },
  button2: {
    id: 11,
    value: '<button class="btn btn-blue" href="#!" type="button"></button>',
    parentId: 3, // Внутри best__content
    order: 8,
  },
};

const Constructor = () => {
  const [result, setResult] = useState<string>("");
  const [base, setBase] = useState<Item[]>([
    { id: 0, value: '<div class="best"></div>', children: ["1"] },
    { id: 1, value: '<div class="best__wrap"></div>', children: ["3"] },
    { id: 3, value: '<div class="best__content"></div>', children: [] },
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
          // Для best__wrap (id: 1): img (2), затем best__content (3)
          if (item.id === 1) {
            const imgPresent = updatedBase.some((i) => i.id === 2);
            const children = imgPresent ? ["2", "3"] : ["3"];
            return { ...item, children };
          }
          // Для best__content (id: 3): сортируем по order
          if (item.id === 3) {
            const siblings = Object.values(availableElements)
              .filter((el) => el.parentId === 3)
              .sort((a, b) => a.order - b.order)
              .map((el) => el.id.toString());
            const newChildren = siblings.filter((id) =>
              updatedBase.some((item) => item.id.toString() === id)
            );
            return { ...item, children: newChildren };
          }
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
          className="bg-lime-400 w-10 h-6 border border-slate-800 flex justify-center items-center rounded-2xl"
          title="Рендерить и показать результат"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
        <button
          className="bg-red-400 w-10 h-6 border border-slate-800 flex justify-center items-center rounded-2xl"
          onClick={() => {
            setResult("");
            setBase([
              { id: 0, value: '<div class="best"></div>', children: ["1"] },
              {
                id: 1,
                value: '<div class="best__wrap"></div>',
                children: ["3"],
              },
              {
                id: 3,
                value: '<div class="best__content"></div>',
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
              {key === "img" ? (
                <div className="imgs">
                  <Image
                    src="/assets/images/18.jpg"
                    alt="18"
                    width={160}
                    height={160}
                  />
                </div>
              ) : key === "svg" ? (
                <Globe width={50} height={50} className="fill-blue-500" />
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
          <pre>{result}</pre>
        </div>
      </div>
    </div>
  );
};

export default Constructor;

// "use client";
// import React, { useEffect, useState } from "react";
// import htmlToScss from "@/app/utils/htmlToScss";
// import Image from "next/image";
// import {
//   XMarkIcon,
//   DocumentDuplicateIcon,
//   ArrowUpIcon,
//   ArrowDownIcon,
//   ArrowUturnLeftIcon,
//   PlusIcon,
//   TrashIcon,
// } from "@heroicons/react/24/outline";
// import Globe from "../../../public/globe.svg";
// import { useStateContext } from "@/components/StateProvider";
// import { useRouter } from "next/navigation";
// import TagTree from "@/components/TagTree/TagTree";

// interface Item {
//   id: number;
//   value: string;
//   children: string[];
// }

// const Constructor = () => {
//   const router = useRouter();
//   const [result, setResult] = useState<string>("");
//   const {
//     stone,
//     setStone,
//     handlerLastTags,
//     lastTags,
//     handlerSetTags,
//     providerTags,
//   } = useStateContext();
//   const base: Item[] = [
//     { id: 0, value: '<div class="best"></div>', children: [] },
//     // `<div class="best__wrap"></div>`,
//     // `<div class="best__content"></div>`,
//     // `<div class="best__img rel"><div class="imgs"><img src="" alt=""></div></div>`,
//     // `<svg><use xlink:href="#flag"></use></svg>`,
//     // `<h2></h2>`,
//     // `<h3></h3>`,
//     // `<span></span>`,
//     // `<a class="best __link" href="#"></a>`,
//     // `<button class="btn btn-success but-wave" href="#!" type="button"></button>`,
//     // `<button class="btn btn-blue" href="#!" type="button"></button>`,

//     // '<div class="best"><div class="best __wrap"><div class="best __img rel"><div class="imgs"><img src="" alt=""></div></div><div class="best __content"><svg><use xlink:href="#flag"></use></svg><h2></h2><h3></h3><p class="best __text"></p><span></span><a class="best __link" href="#"></a><button class="btn btn-success but-wave" href="#!" type="button"></button><button class="btn btn-blue" href="#!" type="button"></button></div></div></div>',
//   ];

//   // const handlerResult = () => {
//   //   handlerSetTags(result);
//   //   router.push("/");
//   // };
//   // const handlerScss = () => {
//   //   const scssOutput = result.map((tag) => htmlToScss(tag).scss).join("\n");
//   //   return scssOutput;
//   // };
//   return (
//     <div>
//       <div className="flex gap-4 mb-2">
//         <button
//           onClick={() => {}}
//           className="bg-lime-400 w-10  h-6  border border-[slate-800] flex justify-center items-center rounded-2xl"
//         >
//           <PlusIcon className="w-4 h-4" />
//         </button>{" "}
//         <button
//           className="bg-red-400 w-10  h-6  border border-[slate-800] flex justify-center items-center rounded-2xl"
//           onClick={() => {
//             setResult([]);
//           }}
//         >
//           <TrashIcon className="w-4 h-4" />
//         </button>
//       </div>
//       <div className="grid grid-cols-[1fr_20%_20%]">
//         <div className="bg-slate-200 grid grid-cols-[160px_1fr] ">
//           <button
//             type="button"
//             className={`bg-slate-400 w-40 aspect-ratio-1/2 h-40 min-h-40 border border-[slate-800] relative opacity-40 ${
//               result.includes(base[0].value) ? "opacity-100" : ""
//             }`}
//             onClick={() => {
//               setResult(base[0]);
//             }}
//           >
//             <div className="imgs">
//               <Image
//                 src="/assets/images/18.jpg"
//                 alt="18"
//                 width={160}
//                 height={160}
//               />
//             </div>
//           </button>
//           <div className="flex flex-col">
//             <button
//               type="button"
//               className="bg-slate-400 w-40  border border-[slate-800] flex justify-center items-center opacity-40"
//             >
//               <Globe width={50} height={50} className="fill-blue-500" />
//             </button>
//             <button
//               type="button"
//               className="bg-slate-400 w-40  border border-[slate-800] opacity-40"
//             >
//               h2
//             </button>
//             <button
//               type="button"
//               className="bg-slate-400 w-40  border border-[slate-800] opacity-40"
//             >
//               p
//             </button>
//             <button
//               type="button"
//               className="bg-slate-400 w-40  border border-[slate-800] opacity-40"
//             >
//               span
//             </button>
//             <button
//               type="button"
//               className="bg-slate-400 w-40  border border-[slate-800] opacity-40"
//             >
//               button
//             </button>
//           </div>
//         </div>
//         {/* <div
//           className="border-slate-800 border"
//           // onClick={() => {
//           //   handlerResult();
//           // }}
//         >
//            <TagTree tags={[...result]} />
//         </div>*/}
//         <div className="border-slate-800 border">{result.value}</div>
//         {/* <div
//           className="border-slate-800 border"
//           onClick={() => {
//             navigator.clipboard.writeText(handlerScss());
//           }}
//         >
//            {handlerScss()}
//         </div> */}
//       </div>
//     </div>
//   );
// };
