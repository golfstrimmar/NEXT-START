import { useState, useEffect } from "react";
import Calendar from "@/components/ui/Calendar/Calendar";
import ClockUhr from "@/components/ui/ClockUhr/ClockUhr";
import "./book.scss";

// Типы для пропсов компонентов Calendar и ClockUhr
interface CalendarProps {
  setErrors: (error: string) => void;
  setDate: (date: string) => void;
  closeCalendar: () => void;
  minDate: Date;
  flag: "in" | "out";
  initialDate: Date;
}

interface ClockUhrProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Book: React.FC = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Обнуляем время
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const [checkIn, setCheckIn] = useState<string>(
    today.toLocaleDateString("de-DE")
  );

  const [checkOut, setCheckOut] = useState<string>(
    tomorrow.toLocaleDateString("de-DE")
  );
  const [checkInTime, setCheckInTime] = useState<string>("00:00"); // Время заезда
  const [checkOutTime, setCheckOutTime] = useState<string>("00:00"); // Время выезда
  const [guests, setGuests] = useState<number>(0);
  const [errors, setErrors] = useState<string>("");
  const [openCalendarIn, setOpenCalendarIn] = useState<boolean>(false);
  const [openCalendarOut, setOpenCalendarOut] = useState<boolean>(false);

  // Функция для преобразования строки в объект Date
  const parseDate = (dateString: string): Date => {
    const [day, month, year] = dateString.split(".").map(Number);
    return new Date(year, month - 1, day); // Месяцы в Date начинаются с 0
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !checkIn ||
      !checkOut ||
      !checkInTime ||
      !checkOutTime ||
      guests === 0
    ) {
      setErrors("Заполните, пожалуйста, все поля формы.");
      setTimeout(() => {
        setErrors("");
      }, 2000);
      return;
    }
    const params = new URLSearchParams({
      checkin: checkIn,
      checkin_time: checkInTime,
      checkout: checkOut,
      checkout_time: checkOutTime,
      guests: guests.toString(),
    });
    window.history.pushState(null, "", `?${params.toString()}`);
    setCheckIn(today.toLocaleDateString("de-DE"));
    setCheckOut(tomorrow.toLocaleDateString("de-DE"));
    setCheckInTime("00:00");
    setCheckOutTime("00:00");
    setGuests(0);
    setOpenCalendarIn(false);
    setOpenCalendarOut(false);
  };

  useEffect(() => {
    const tempIn = parseDate(checkIn); // Преобразуем строку в объект Date
    const tempOut = parseDate(checkOut);

    if (tempIn >= tempOut) {
      // Если дата заезда позже или равна дате выезда, сдвигаем checkOut на 1 день
      const newCheckOut = new Date(tempIn);
      newCheckOut.setDate(tempIn.getDate() + 1); // Увеличиваем дату на 1 день

      // Обновляем состояние checkOut
      setCheckOut(newCheckOut.toLocaleDateString("de-DE"));
    }
  }, [checkIn, checkOut]);

  useEffect(() => {
    if (errors !== "") {
      setTimeout(() => {
        setErrors("");
      }, 1500);
    }
  }, [errors, openCalendarIn, openCalendarOut, checkIn, checkOut]);
  const [check, setCheck] = useState<string>(today.toLocaleDateString("de-DE"));
  return (
    <div className="book">
      <div className="container">
        {errors && <h3 className="errors center">{errors}</h3>}
        {check && <p>{check}</p>}
        <Calendar
          selectedDate={check}
          handleDateChange={setCheck}
          // setErrors={setErrors}
          // setDate={setCheckIn}
          // closeCalendar={() => setOpenCalendarIn(false)}
          // minDate={new Date()}
          // flag="in"
          // initialDate={
          //   new Date(checkIn.split(".").reverse().join("-"))
          // }
        />
        <div className="book__wrap">
          <h2>Бронирование</h2>
          <form className="book__date" onSubmit={handleSubmit}>
            <div
              className="book__section relative"
              onClick={() => {
                setOpenCalendarIn((prev) => !prev);
                setOpenCalendarOut(false);
              }}
            >
              <div className="input-field">
                <input
                  id="In"
                  type="text"
                  name="checkin"
                  value={`${checkIn} ${checkInTime}`}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCheckIn(e.target.value)
                  }
                  placeholder="Дата и время заезда"
                  readOnly
                />
                <label className="text-field__label" htmlFor="In">
                  Заезд
                </label>
              </div>
              {openCalendarIn && (
                <div className="book-calendar">
                  <Calendar
                    selectedDate={
                      new Date(checkIn.split(".").reverse().join("-"))
                    }
                    handleDateChange={setCheckIn}
                    // setErrors={setErrors}
                    // setDate={setCheckIn}
                    // closeCalendar={() => setOpenCalendarIn(false)}
                    // minDate={new Date()}
                    // flag="in"
                    // initialDate={
                    //   new Date(checkIn.split(".").reverse().join("-"))
                    // }
                  />
                  <ClockUhr
                    value={checkInTime}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCheckInTime(e.target.value)
                    }
                  />
                </div>
              )}
            </div>
            <div
              className="book__section"
              onClick={() => {
                setOpenCalendarIn(false);
                setOpenCalendarOut((prev) => !prev);
              }}
            >
              <div className="input-field">
                <input
                  id="Out"
                  type="text"
                  name="checkout"
                  value={`${checkOut} ${checkOutTime}`}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCheckOut(e.target.value)
                  }
                  placeholder="Дата и время выезда"
                  readOnly
                />
                <label className="text-field__label" htmlFor="Out">
                  Выезд
                </label>
              </div>
              {openCalendarOut && (
                <div className="calendar">
                  <Calendar
                    setErrors={setErrors}
                    setDate={setCheckOut}
                    closeCalendar={() => setOpenCalendarOut(false)}
                    flag="out"
                    minDate={
                      checkIn
                        ? new Date(checkIn.split(".").reverse().join("-"))
                        : new Date()
                    }
                    initialDate={
                      new Date(checkOut.split(".").reverse().join("-"))
                    }
                  />
                  <ClockUhr
                    value={checkOutTime}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCheckOutTime(e.target.value)
                    }
                  />
                </div>
              )}
            </div>
            <div
              className="book__section"
              onClick={() => {
                setOpenCalendarIn(false);
                setOpenCalendarOut(false);
              }}
            >
              <div className="input-field">
                <input
                  id="Guests"
                  type="number"
                  name="guests"
                  value={guests}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setGuests(Number(e.target.value))
                  }
                  placeholder="Количество гостей"
                  min="0"
                />
                <label className="text-field__label" htmlFor="Guests">
                  Гости
                </label>
              </div>
            </div>
            <button className="btn btn-success form-button" type="submit">
              Найти
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Book;
