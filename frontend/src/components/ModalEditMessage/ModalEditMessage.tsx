"use client";
import React, { useEffect, useState } from "react";
import styles from "./ModalEditMessage.module.scss";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button/Button";
import { useSelector, useDispatch } from "react-redux";
import Image from "next/image";
import Input from "@/components/ui/Input/Input";
import ModalMessage from "@/components/ModalMessage/ModalMessage";
import { Socket } from "socket.io-client"; // Исправляем импорт для Socket.IO
import { useRouter } from "next/navigation";
import { User } from "@/types/user";
import { MessageType } from "@/types/message";
import { updateMessage } from "@/app/redux/slices/messagesSlice"; // Импортируем новое действие

interface ModalEditMessageProps {
  onClose: () => void;
  message: MessageType;
}

const ModalEditMessage: React.FC<ModalEditMessageProps> = ({
  onClose,
  message,
}) => {
  const user: User = useSelector((state) => state.auth.user);
  const socket: Socket = useSelector((state) => state.socket.socket);
  const dispatch = useDispatch();
  const router = useRouter();
  const [editedMessage, setEditedMessage] = useState<MessageType>({
    id: message.id,
    text: message.text,
    author: message.author,
    authorID: message.authorID,
    createdAt: message.createdAt,
  });
  const [text, setText] = useState<string>(message.text);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [router, user]);

  useEffect(() => {
    setEditedMessage((prev) => ({
      ...prev,
      text: text,
    }));
  }, [text]);

  useEffect(() => {
    socket.on("message_updated", (updatedMessage: MessageType) => {
      console.log("<==== Updated message from server ====>", updatedMessage);
      setError("Message updated successfully");
      setShowModal(true);
      setTimeout(() => {
        dispatch(updateMessage(updatedMessage));
        onClose();
        setShowModal(false);
        setError("");
      }, 1500);
    });

    return () => {
      socket.off("message_updated");
    };
  }, [socket, dispatch, onClose]);

  const handleEditMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedMessage.text === "") {
      setError("Text is required");
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        setError("");
      }, 1500);
      return;
    }

    console.log("<==== Edited Message ====>", editedMessage);
    socket.emit("edit_message", editedMessage);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-[100vw] h-[100vh] fixed top-0 pt-20 sm:pt-0 left-0 flex justify-center items-center bg-[rgba(0,0,0,.95)] z-100 p-4"
      >
        <motion.div
          initial={{ scale: 0, y: 0 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-gray-300 rounded-lg p-1 sm:p-4"
        >
          {error && <ModalMessage message={error} open={showModal} />}
          <Image
            onClick={onClose}
            src="/assets/svg/cross.svg"
            alt="cross"
            width={24}
            height={24}
            className="absolute top-6 right-10 cursor-pointer z-50 border border-gray-300 rounded-full p-1 hover:bg-gray-200 transition-all duration-200"
          />
          <form className="w-full relative mb-8 bg-white border border-gray-300 rounded-lg p-1 sm:p-4">
            <h2 className="text-2xl font-semibold mb-4">
              Edit Message for User: {user?.userName}
            </h2>
            <div className="mb-4">
              <Input
                typeInput="textarea"
                id="text"
                data="Text"
                name="text"
                value={editedMessage.text}
                onChange={(e) => setText(e.target.value)}
                required
              />
            </div>
            <Button
              buttonText="Save Changes"
              buttonType="submit"
              onClick={(e) => handleEditMessage(e)}
            />
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModalEditMessage;
