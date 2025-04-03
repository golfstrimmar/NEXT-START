// ui/Select.tsx
import React, { useState, useEffect } from "react";
import "@/scss/common/colors.scss";
import Shevron from "@/assets/svg/chevron-down.svg";
import styles from "./Select.module.scss";

interface Item {
  name: string;
  value: "accepted" | "shipped" | "delivered" | "cancelled";
}

interface SelectProps {
  setSortOrder: (
    order: "accepted" | "shipped" | "delivered" | "cancelled"
  ) => void;
  selectItems: Item[];
  initialValue?: string;
}

const Select: React.FC<SelectProps> = ({
  setSortOrder,
  selectItems,
  initialValue,
}) => {
  const [active, setActive] = useState<boolean>(false);
  const initialItem = selectItems.find((item) => item.value === initialValue);
  const [selectedValue, setSelectedValue] = useState<string>(
    initialItem ? initialItem.name : selectItems[0].name
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

  useEffect(() => {
    const item = selectItems.find((item) => item.value === initialValue);
    if (item && item.name !== selectedValue) {
      setSelectedValue(item.name);
    }
  }, [initialValue, selectItems]);

  const handlerClickItem = (item: Item) => {
    setSelectedValue(item.name);
    setSortOrder(item.value);
    setActive(false);
  };

  const getStatusClass = (value: string) => {
    switch (value) {
      case "accepted":
        return "bg-yellow-400 text-white border-yellow-500 border-2 hover:border-yellow-700";
      case "shipped":
        return "bg-green-400 text-white border-green-500 border-2 hover:border-green-700";
      case "delivered":
        return "bg-blue-400 text-white border-blue-500 border-2 hover:border-blue-700";
      case "cancelled":
        return "bg-red-400 text-white border-red-500 border-2   hover:border-red-700";
      default:
        return "";
    }
  };

  const selectedItem = selectItems.find((item) => item.name === selectedValue);

  const buttonClass = selectedItem
    ? getStatusClass(selectedItem.value)
    : getStatusClass(selectItems[0].value);

  return (
    <div
      className={`${styles["select"]} ${active ? styles["_is-active"] : ""}`}
    >
      <button
        className={`${styles["dropdown-button"]} ${buttonClass}`}
        onClick={(event) => {
          event.stopPropagation();
          setActive((prev) => !prev);
        }}
      >
        <span>{selectedValue}</span>
        <input type="hidden" name="place" value={selectedValue} />
        <Shevron />
      </button>
      <ul className={`${styles["dropdown-list"]}`}>
        {selectItems.map((item, index) => (
          <li
            key={index}
            onClick={() => handlerClickItem(item)}
            className={`${styles["dropdown-list__item"]} ${getStatusClass(
              item.value
            )}`}
            data-value={item.value}
          >
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Select;
