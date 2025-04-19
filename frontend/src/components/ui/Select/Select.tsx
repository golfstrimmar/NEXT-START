import React, { useState, useEffect } from "react";
import "@/scss/common/colors.scss";
import styles from "./Select.module.scss";
import Image from "next/image";

// Тип элемента
interface Item {
  name: string;
  value: "asc" | "desc"; // Значение может быть только "asc" или "desc"
}

// Пропсы компонента Select
interface SelectProps {
  setSortOrder: (order: "asc" | "desc") => void;
  selectItems: Item[]; // Массив объектов типа Item
}

const Select: React.FC<SelectProps> = ({ setSortOrder, selectItems }) => {
  const [active, setActive] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<string>(
    selectItems[0].name
  );

  useEffect(() => {
    const handleClick = (event: MouseEvent): void => {
      const target = event.target as Element;
      if (!target.closest(".select")) {
        setActive(false);
      }
    };
    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, []);

  // -----------------------------
  const handlerClickItem = (item: Item) => {
    setSelectedValue(item.name); //в браузер отправляем текст
    setSortOrder(item.value); // в родителя отправляем value
    setActive(false);
  };

  return (
    <>
      <div
        className={`${styles["select"]} ${active ? styles["_is-active"] : ""}`}
      >
        <button
          className={`${styles["dropdown-button"]}`}
          onClick={(event) => {
            event.stopPropagation();
            setActive((prev) => !prev);
          }}
        >
          <span>{selectedValue}</span>
          <input type="hidden" name="place" value={selectedValue} />
          <Image
            src="/assets/svg/chevron-down.svg"
            alt="chevron-down"
            width={50}
            height={50}
            className="fill-blue-500"
          />
        </button>
        <ul className={`${styles["dropdown-list"]} `}>
          {selectItems.map((item, index) => (
            <li
              key={index}
              onClick={() => handlerClickItem(item)}
              className={`${styles["dropdown-list__item"]}`}
              data-value={item.value}
            >
              {item.name}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Select;
