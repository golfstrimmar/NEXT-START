import React from "react";
import "./ModalMessage.scss";
interface ModalMessageProps {
  message: string; // Сообщение, которое будет отображаться
  open: boolean; // Флаг для управления видимостью модального окна
}
const ModalMessage: React.FC<ModalMessageProps> = ({ message, open }) => {
  return (
    <div
      className={`w-1/2 bg-[rgba(0, 0, 0, .9)] modalmessage  ${
        open ? "run" : ""
      }  `}
    >
      <div className="w-full bg-red-700 shadow-[inset_0_0_12px_rgba(255,255,255)]   rounded">
        <h3 className="grid place-items-center text-italic p-2 text-amber-50">
          {message}
        </h3>
      </div>
    </div>
  );
};

export default ModalMessage;
