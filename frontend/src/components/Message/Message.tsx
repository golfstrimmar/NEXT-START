"use client";
import React, { useState, useEffect } from "react";
import { MessageType } from "@/types/message";
import { useSelector, useDispatch } from "react-redux";
import { deleteMessage } from "@/app/redux/slices/messagesSlice";
import { User } from "@/types/user";
import ModalEditMessage from "@/components/ModalEditMessage/ModalEditMessage";
import Image from "next/image";
import dynamic from "next/dynamic";
const ModalMessage = dynamic(
  () => import("@/components/ModalMessage/ModalMessage"),
  {
    ssr: false,
  }
);

interface MessageProps {
  msg: MessageType;
}

const Message: React.FC<MessageProps> = ({ msg }) => {
  const dispatch = useDispatch();
  const user: User = useSelector((state) => state.auth.user);
  const socket: Socket = useSelector((state) => state.socket.socket);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isAuthor, setisAuthor] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [openModalMessage, setOpenModalMessage] = useState<boolean>(false);
  const [isModalVisible, setisModalVisible] = useState<boolean>(false);
  useEffect(() => {
    if (user?.userName === msg?.author) {
      setisAuthor(true);
    }
  }, [user, msg]);
  // -------------------------------
  useEffect(() => {
    if (socket) {
      const handleMessageDeleted = (deletedMessage: MessageType) => {
        dispatch(deleteMessage(deletedMessage.id));
        setSuccessMessage("Message deleted successfully.");
        setOpenModalMessage(true);
        setisModalVisible(true);
        setTimeout(() => {
          setOpenModalMessage(false);
          setSuccessMessage("");
        }, 1500);
      };
      socket.on("message_deleted", handleMessageDeleted);

      return () => {
        socket.off("message_deleted", handleMessageDeleted);
      };
    }
  }, [socket, dispatch]);
  // -------------------------------
  const handleDelete = (id: number) => {
    if (socket?.connected) {
      socket.emit("delete_message", { id: Number(id) });
    }
  };
  // -------------------------------
  return (
    <div>
      {isModalVisible && (
        <ModalMessage message={successMessage} open={openModalMessage} />
      )}
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
            <div className="flex gap-2">
              <Image
                src="/assets/svg/edit.svg"
                width={20}
                height={20}
                alt="edit"
                onClick={() => setIsModalOpen(true)}
                className="cursor-pointer hover:scale-110 transition-transform duration-200"
              />
              <Image
                src="/assets/svg/cross.svg"
                width={20}
                height={20}
                alt="delete"
                className="cursor-pointer hover:scale-110 transition-transform duration-200"
                onClick={() => handleDelete(msg.id)}
              />
            </div>
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
