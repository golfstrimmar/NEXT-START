"use client";
import React, { useEffect, useState } from "react";
import styles from "./ModalAddEvent.module.scss";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button/Button";
import Image from "next/image";
import Input from "@/components/ui/Input/Input";
import ModalMessage from "@/components/ModalMessage/ModalMessage";
import { Socket } from "dgram";
import { User } from "@/types/user";
import { useSelector, useDispatch } from "react-redux";
import { addComment } from "@/app/redux/slices/commentsSlice";
import dynamic from "next/dynamic";
const ModalMessage = dynamic(
  () => import("@/components/ModalMessage/ModalMessage"),
  {
    ssr: false,
  }
);
interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  messageId: string;
  createdAt: string;
}

interface ModalAddCommentProps {
  onClose: () => void;
  messageId: string;
}

const ModalAddComment = ({ onClose, messageId }: ModalAddCommentProps) => {
  const dispatch = useDispatch();
  const user: User = useSelector((state) => state.auth.user);
  const socket: Socket = useSelector((state) => state.socket.socket);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [openModalMessage, setOpenModalMessage] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [comment, setComment] = useState<Comment>({
    id: "",
    text: "",
    userId: "",
    userName: "",
    messageId,
    createdAt: "",
  });
  const [text, setText] = useState<string>("");

  useEffect(() => {
    if (!user) {
      window.location.href = "/";
    } else {
      setComment((prev) => ({
        ...prev,
        userId: user?._id,
        userName: user?.userName,
        messageId,
      }));
    }
  }, [user, messageId]);

  useEffect(() => {
    setComment((prev) => ({
      ...prev,
      text,
    }));
  }, [text]);

  const handleCreateComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.text.trim() === "") {
      setSuccessMessage("Comment text is required.");
      setOpenModalMessage(true);
      setIsModalVisible(true);
      setTimeout(() => {
        setOpenModalMessage(false);
        setSuccessMessage("");
      }, 2000);
      return;
    }

    console.log("<==== Creating comment ====>", comment);
    socket.emit("create_comment", {
      messageId: comment.messageId,
      userId: comment.userId,
      text: comment.text,
      createdAt: new Date().toISOString(),
    });
    onClose();
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
              User: {user?.userName}
            </h2>
            <div className="mb-4">
              <Input
                typeInput="textarea"
                id="text"
                data="Comment"
                name="text"
                value={comment.text}
                onChange={(e) => setText(e.target.value)}
                required
              />
            </div>
            <Button
              buttonText="Create Comment"
              buttonType="submit"
              onClick={handleCreateComment}
            />
          </form>
          {isModalVisible && (
            <ModalMessage message={successMessage} open={openModalMessage} />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModalAddComment;
