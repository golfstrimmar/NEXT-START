"use client";
import React, { useEffect } from "react";
import { MessageType } from "@/types/message";
interface MessageProps {
  msg: MessageType;
}

const Message: React.FC<MessageProps> = ({ msg }) => {
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
