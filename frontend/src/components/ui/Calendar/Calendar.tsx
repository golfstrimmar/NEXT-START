"use client";
import React, { useState, useEffect } from "react";
import styles from "./Calendar.module.scss";

// Типы для пропсов компонента
interface CalendarProps {
  setDate: (date: string) => void;
  closeCalendar: () => void;
  minDate: Date | null;
  initialDate: Date | null;
  setErrors: (error: string) => void;
  flag: "in" | "out";
}

const weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const months = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const Calendar: React.FC<CalendarProps> = ({
  setDate,
  closeCalendar,
  minDate,
  initialDate,
  setErrors,
  flag,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const date = initialDate || new Date();
    date.setHours(0, 0, 0, 0); // Обнуляем время
    return date;
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    const date = initialDate || null;
    if (date) date.setHours(0, 0, 0, 0); // Обнуляем время
    return date;
  });

  useEffect(() => {
    const date = initialDate || new Date();
    date.setHours(0, 0, 0, 0); // Обнуляем время
    setCurrentDate(date);
    setSelectedDate(initialDate ? date : null);
  }, [initialDate]);

  const getDaysInMonth = (date: Date): (number | null)[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);
    const days = [];

    const firstDayOfMonth =
      startOfMonth.getDay() === 0 ? 6 : startOfMonth.getDay() - 1;

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    for (let i = 1; i <= endOfMonth.getDate(); i++) {
      days.push(i);
    }

    return days;
  };

  const handleDayClick = (day: number | null) => {
    if (day) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const newDate = new Date(year, month, day);
      newDate.setHours(0, 0, 0, 0); // Обнуляем время

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Обнуляем время для текущей даты

      // Проверяем, что дата не раньше текущей
      if (newDate < today) {
        setErrors("Дата не может быть меньше текущей.");
        return;
      }

      // Проверяем minDate (например, выезд не раньше заезда)
      if (minDate && newDate < minDate && flag === "out") {
        setErrors("Дата отъезда должна быть не раньше даты приезда.");
        return;
      }
      if (minDate) {
        const minCheckOutDate = new Date(minDate);
        minCheckOutDate.setDate(minCheckOutDate.getDate() + 1); // Минимальная дата выезда = minDate + 1 день
        if (newDate < minCheckOutDate && flag === "out") {
          setErrors("Дата выезда должна быть минимум на день позже заезда.");
          return;
        }
      }
      setSelectedDate(newDate);
      const formattedDate = newDate.toLocaleDateString("de-DE"); // Формат DD.MM.YYYY
      setDate(formattedDate);
      closeCalendar();
    }
  };

  const handleMonthChange = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    newDate.setHours(0, 0, 0, 0); // Обнуляем время
    setCurrentDate(newDate);
  };

  const handleYearChange = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(currentDate.getFullYear() + direction);
    newDate.setHours(0, 0, 0, 0); // Обнуляем время
    setCurrentDate(newDate);
  };

  const daysInMonth = getDaysInMonth(currentDate);

  return (
    <div className={`${styles["calendar"]} ${styles["rel"]}`}>
      <div className={`${styles["calendar-header"]}`}>
        <button
          type="button"
          className={`${styles["arrow-btn"]} ${styles["prev-year"]}`}
          onClick={(e) => {
            e.stopPropagation();
            handleYearChange(-1);
          }}
        >
          {"<<"}
        </button>
        <button
          type="button"
          className={`${styles["arrow-btn"]} ${styles["prev-month"]}`}
          onClick={(e) => {
            e.stopPropagation();
            handleMonthChange(-1);
          }}
        >
          {"<"}
        </button>
        <span>
          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </span>
        <button
          type="button"
          className={`${styles["arrow-btn"]} ${styles["next-month"]}`}
          onClick={(e) => {
            e.stopPropagation();
            handleMonthChange(1);
          }}
        >
          {">"}
        </button>
        <button
          type="button"
          className={`${styles["arrow-btn"]} ${styles["next-year"]}`}
          onClick={(e) => {
            e.stopPropagation();
            handleYearChange(1);
          }}
        >
          {">>"}
        </button>
      </div>
      <div className={`${styles["calendar-grid"]}`}>
        {weekdays.map((day, index) => (
          <div key={index} className={`${styles["calendar-day"]}`}>
            {day}
          </div>
        ))}
        {daysInMonth.map((day, index) => {
          const isSelected =
            day &&
            selectedDate &&
            day === selectedDate.getDate() &&
            currentDate.getMonth() === selectedDate.getMonth() &&
            currentDate.getFullYear() === selectedDate.getFullYear();

          return (
            <div
              key={index}
              className={`${styles["calendar-day"]} ${
                isSelected ? styles["selected"] : ""
              }`}
              onClick={() => handleDayClick(day)}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
