"use client";
import React, { useEffect, useState } from "react";
import styles from "./Ui.module.scss";
import Button from "@/components/ui/Button/Button";
import Burger from "@/components/ui/Burger/Burger";
import Input from "@/components/ui/Input/Input";
import InputCheck from "@/components/ui/InputCheck/InputCheck";
import InputRadio from "@/components/ui/InputRadio/InputRadio";
import Select from "@/components/ui/Select/Select";
import Calendar from "@/components/ui/Calendar/Calendar";
import ClockUhr from "@/components/ui/ClockUhr/ClockUhr";
import Book from "@/components/ui/Book/Book";
import Tabs from "@/components/ui/Tabs/Tabs";
// =======================

// =======================
interface UiProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}

const Ui: React.FC<UiProps> = () => {
  const [value, setValue] = useState<string>("");
  const [valueNumber, setValueNumber] = useState<number>(0);
  const [valueTextarea, setValueTextarea] = useState<string>("");
  const [endTime, setEndTime] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );
  const [valueCheck, setValueCheck] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedOptionRadio, setSelectedOptionRadio] =
    useState<string>("option1Radio");
  const RadioOptions = ["option1Radio", "option2Radio", "option3Radio"];
  // -------------------------
  const selectItems = [
    { name: "Newest First", value: "desc" },
    { name: "Oldest First", value: "asc" },
  ] as const;
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    if (sortOrder) {
      console.log("<==== sortOrder====>", sortOrder);
    }
  }, [sortOrder]);
  // -------------------------
  const handlerInputOnChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setValue(e.target.value);
  };
  useEffect(() => {
    console.log(value);
  }, [value]);
  // -------------------------
  const onChangeTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValueTextarea(e.target.value);
  };

  useEffect(() => {
    console.log(valueTextarea);
  }, [valueTextarea]);
  // -----------------------------------
  const handlerCheckOnChange: React.ChangeEventHandler<HTMLInputElement> = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setValueCheck(e.target.checked ? "option1" : "");
  };
  useEffect(() => {
    console.log(valueCheck);
  }, [valueCheck]);
  // -----------------------------------
  const onClickButton = () => {
    console.log("Button clicked");
  };
  // -----------------------------------

  const handlerInputOnChangeRadio: React.ChangeEventHandler<
    HTMLInputElement
  > = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOptionRadio(e.target.value); // Обновляем значение радиокнопки
  };

  useEffect(() => {
    console.log(selectedOptionRadio); // Отслеживаем выбранное значение
  }, [selectedOptionRadio]);

  // -----------------------------------
  const handlerNumberOnChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setValueNumber(e.target.value);
  };
  useEffect(() => {
    console.log(valueNumber);
  }, [valueNumber]);
  // =================================
  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("New endTime:", e.target.value);
    setEndTime(e.target.value);
  };
  useEffect(() => {
    console.log(endTime);
  }, [endTime]);
  // =================================
  const [finishDate, setFinishDate] = useState<object>(null);
  useEffect(() => {
    console.log("==finishDate==", finishDate);
  }, [finishDate]);
  // =================================
  const [Uhr, setUhr] = useState<string>("00:00");

  const handlerUhrOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUhr(e.target.value);
  };
  // ==============для календаря===================
  const [check, setCheck] = useState<Date>(new Date());

  const handleDateChange = (date: Date) => {
    if (date) {
      setCheck(date);
    }
  };
  // =============
  return (
    <div className={styles["ui-page"]}>
      <hr className="my-4" />
      <h2 className="text-[#006B36] text-2xl">Calendar</h2>
      {check && <p>{new Date(check).toLocaleDateString("de-DE")} </p>}
      <Calendar selectedDate={check} handleDateChange={handleDateChange} />

      {/* ========Book=========== */}
      <hr className="my-4" />
      <Book />

      {/* ========Tabs=========== */}
      <hr className="my-4" />

      <h2 className="text-[#006B36] text-2xl">Tabs</h2>
      <div className="flex gap-4">
        <Tabs />
        <Tabs />
      </div>
      {/* ========Select=========== */}
      <hr className="my-4" />
      <h2 className="text-[#006B36] text-2xl">Select</h2>
      <h4>sortOrder: {sortOrder}</h4>
      <Select
        selectItems={selectItems}
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
        setSortOrder={setSortOrder}
      />
      {/* ========Burger=========== */}
      <hr className="my-4" />
      <h2 className="text-[#006B36] text-2xl">Burger-sm</h2>
      <div className="m-4 bg-black">
        <Burger handlerburgerClick={() => setIsOpen(!isOpen)} isOpen={isOpen} />
      </div>
      {/* ========Input=========== */}
      <div className="m-4"></div>
      <p>Input value: {value}</p>
      <Input
        typeInput="text"
        data="Name"
        value={value}
        onChange={handlerInputOnChange}
      />
      {/* ========Input===textarea======== */}
      <div className="m-4"></div>
      <Input
        typeInput="textarea"
        data="TextareaName"
        value={valueTextarea}
        onChange={onChangeTextarea}
      />
      {/* ========Input number=========== */}
      <div className="m-4"></div>
      <p>Input valueNumber: {valueNumber}</p>
      <Input
        typeInput="number"
        data="Number"
        value={valueNumber}
        onChange={handlerNumberOnChange}
      />
      {/* ================= */}
      <p>End Time: {endTime}</p>
      <Input
        typeInput="datetime-local"
        data="End Time"
        value={endTime}
        onChange={handleEndTimeChange}
      />

      {/* ============================== */}
      <div className="m-4"></div>
      <p>Uhr:{Uhr}</p>
      <ClockUhr value={Uhr} onChange={handlerUhrOnChange} />
      {/* =======InputCheck============ */}
      <hr className="my-4" />
      <h2 className="text-[#006B36] text-2xl">Check</h2>
      <InputCheck
        type="checkbox"
        data="Check"
        value={valueCheck}
        checkedValue="option1"
        onChange={handlerCheckOnChange}
      />
      {/* ========InputRadio=========== */}
      <hr className="my-4" />
      <h2 className="text-[#006B36] text-2xl">Radio</h2>
      <InputRadio
        type="radio"
        data="RadioOption"
        options={RadioOptions}
        value={selectedOptionRadio}
        onChange={handlerInputOnChangeRadio}
      />
      {/* =======Button============ */}
      <hr className="my-4" />
      <h2 className="text-[#006B36] text-2xl">Button</h2>
      <Button onClick={onClickButton}>Bid Now</Button>
      {/* =================== */}
    </div>
  );
};

export default Ui;
