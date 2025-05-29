"use client";
import React, { useState, useEffect } from "react";
import { MessageType } from "@/types/message";
import { useSelector } from "react-redux";
import { User } from "@/types/user";
import ModalEditMessage from "@/components/ModalEditMessage/ModalEditMessage"; // Импортируем новый компонент
import Image from "next/image";
interface MessageProps {
  msg: MessageType;
}

const Message: React.FC<MessageProps> = ({ msg }) => {
  const user: User = useSelector((state) => state.auth.user);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isAuthor, setisAuthor] = useState<boolean>(false);

  useEffect(() => {
    if (msg) {
      console.log("<==== msg====>", msg);
    }
  }, [msg]);

  useEffect(() => {
    if (user?.userName === msg?.author) {
      setisAuthor(true);
    }
  }, [user, msg]);

  return (
    <div>
      <div className="flex justify-between items-start">
        <span className="font-semibold text-blue-600">{msg.author}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {new Date(msg.createdAt).toLocaleString("ru-RU", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {isAuthor && (
            <Image
              src="/assets/svg/edit.svg"
              width={20}
              height={20}
              alt="edit"
              onClick={() => setIsModalOpen(true)}
              className="cursor-pointer hover:scale-110 transition-transform duration-200"
            />
          )}
        </div>
      </div>
      <p className="mt-2 text-gray-800">{msg.text}</p>
      {isModalOpen && (
        <ModalEditMessage message={msg} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

export default Message;
