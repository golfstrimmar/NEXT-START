"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button/Button";
import { useSelector, useDispatch } from "react-redux";
import Image from "next/image";
import Input from "@/components/ui/Input/Input";
import { useRouter } from "next/navigation";
import { User } from "@/types/user";
import { CommentType } from "@/types/comment";
import { updateComment } from "@/app/redux/slices/commentsSlice";

import dynamic from "next/dynamic";
const ModalMessage = dynamic(
  () => import("@/components/ModalMessage/ModalMessage"),
  {
    ssr: false,
  }
);

interface ModalEditCommentProps {
  onClose: () => void;
  comment: CommentType;
}

const ModalEditComment: React.FC<ModalEditCommentProps> = ({
  onClose,
  comment,
}) => {
  const user: User = useSelector((state) => state.auth.user);
  const socket: Socket = useSelector((state) => state.socket.socket);
  const dispatch = useDispatch();
  const router = useRouter();
  const [text, setText] = useState<string>(comment.text);
  const [editedComment, setEditedComment] = useState<CommentType>({
    commentId: comment.id,
    userId: comment.userId,
    text: text || comment.text,
  });
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [openModalMessage, setOpenModalMessage] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  useEffect(() => {
    if (!user) {
      setSuccessMessage("Login to edit this comment.");
      setOpenModalMessage(true);
      setIsModalVisible(true);
      setTimeout(() => {
        setOpenModalMessage(false);
        setSuccessMessage("");
        onClose();

        router.push("/login");
      }, 2000);
    }
  }, [router, user]);

  useEffect(() => {
    setEditedComment((prev) => ({
      ...prev,
      text: text,
    }));
  }, [text]);

  useEffect(() => {
    socket.on("comment_updated", (updatedComment: CommentType) => {
      console.log("<==== Updated Comment from server ====>", updatedComment);
      setSuccessMessage("Comment updated successfully");
      setOpenModalMessage(true);
      setIsModalVisible(true);
      setTimeout(() => {
        setText("");
        setEditedComment({
          commentId: null,
          userId: null,
          text: "",
        });
        setOpenModalMessage(false);
        setSuccessMessage("");
        onClose();
      }, 2000);
    });

    return () => {
      socket.off("Comment_updated");
    };
  }, [socket, dispatch, onClose]);

  const handleEditComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedComment.text === "") {
      setSuccessMessage("Text is required.");
      setOpenModalMessage(true);
      setIsModalVisible(true);
      setTimeout(() => {
        setOpenModalMessage(false);
        setSuccessMessage("");
      }, 2000);
      return;
    }

    console.log("<==== Edited Comment ====>", editedComment);
    socket.emit("update_comment", editedComment);
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
              Edit Comment for User: {user?.userName}
            </h2>
            <div className="mb-4">
              <Input
                typeInput="textarea"
                id="text"
                data="Text"
                name="text"
                value={editedComment.text}
                onChange={(e) => setText(e.target.value)}
                required
              />
            </div>
            <Button
              buttonText="Save Changes"
              buttonType="submit"
              onClick={(e) => handleEditComment(e)}
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

export default ModalEditComment;
