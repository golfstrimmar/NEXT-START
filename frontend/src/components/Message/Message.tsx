"use client";
import React, { useEffect } from "react";
import styles from "./Message.module.scss";
import { useSelector } from "react-redux";
interface MessageProps {
  msg: {
    id: string;
    text: string;
    author: string;
    createdAt: string;
  };
}

const Message: React.FC<MessageProps> = ({ msg }) => {
  const socket = useSelector((state: any) => state.socket.socket);
  // ----------------------------------
  useEffect(() => {
    if (socket && msg) {
      const handleUserSuccess = (data) => {
        console.log("<====data id====>", data.id);
        console.log("<====data name====>", data.username);
        console.log("<====data email====>", data.email);
      };
      socket.on("UserSuccess", handleUserSuccess);
      return () => {
        socket.off("UserSuccess", handleUserSuccess);
      };
    }
  }, [socket, msg]);

  useEffect(() => {
    if (socket && msg) {
      const findUser = async () => {
        try {
          socket.emit("find_user", {
            id: msg.author,
          });
        } catch (error) {
          console.error(error);
        }
      };
      findUser();
    }
  }, [socket, msg]);
  return (
    <div>
      <div className="flex justify-between items-start">
        <span className="font-semibold text-blue-600">{msg.author}</span>
        <span className="text-xs text-gray-500">
          {new Date(msg.createdAt).toLocaleString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
      <p className="mt-2 text-gray-800">{msg.text}</p>
    </div>
  );
};

export default Message;
