"use client";
import React, { useState } from "react";
import styles from "./MessageComments.module.scss";
import Image from "next/image";
import User from "@/types/user";
import MessageType from "@/types/message";
import ModalEditComment from "../ModalEditComment/ModalEditComment";
interface CommentType {
  id: number;
  messageId: number;
  userName: string;
  text: string;
  likes: number;
  dislikes: number;
}

interface MessageCommentsProps {
  user: User;
  msg: MessageType;
  handleCommentDislike: (id: number) => void;
  handleCommentLike: (id: number) => void;
  handleCommentDelete: (id: number) => void;
  comments: CommentType[];
}

const MessageComments: React.FC<MessageCommentsProps> = ({
  user,
  msg,
  comments,
  handleCommentLike,
  handleCommentDislike,
  handleCommentDelete,
}) => {
  const [isCommentEditOpen, setIsCommentEditOpen] = useState<boolean>(false);
  const [commentToEdit, setCommentToEdit] = useState<CommentType>({
    id: 0,
    messageId: 0,
    userName: "",
    text: "",
    likes: 0,
    dislikes: 0,
  });
  const handleCommentToEdit = (comment: CommentType) => {
    setIsCommentEditOpen(true);
    setCommentToEdit(comment);
  };

  return (
    <div>
      {comments
        .filter((comment) => comment.messageId === msg.id)
        .map((comment) => (
          <div
            key={comment.id}
            className="border border-gray-400 rounded-md mt-2 p-2 ml-3 "
          >
            <div className="flex items-center gap-2 ">
              <p className="text-gray-400 text-[12px] leading-none ">
                {comment.userName}
              </p>
              <Image
                src="/assets/svg/like.svg"
                width={15}
                height={15}
                alt="dislike"
                className="object-cover cursor-pointer ml-auto"
                onClick={() => {
                  handleCommentLike(comment.id);
                }}
              />
              <span>{comment.likes}</span>
              <div className="transform rotate-[180deg]">
                <Image
                  src="/assets/svg/like.svg"
                  width={15}
                  height={15}
                  alt="dislike"
                  className="object-cover cursor-pointer"
                  onClick={() => {
                    handleCommentDislike(comment.id);
                  }}
                />
              </div>
              <span>{comment.dislikes}</span>

              {user && Number(user?._id) === comment?.userId && (
                <Image
                  src="/assets/svg/edit.svg"
                  width={15}
                  height={15}
                  alt="edit"
                  className="cursor-pointer hover:scale-110 transition-transform duration-150"
                  onClick={() => handleCommentToEdit(comment)}
                />
              )}
              {user && Number(user?._id) === comment?.userId && (
                <Image
                  src="/assets/svg/cross.svg"
                  width={15}
                  height={15}
                  alt="delete"
                  className="cursor-pointer hover:scale-110 transition-transform duration-150"
                  onClick={() => handleCommentDelete(comment.id)}
                />
              )}
            </div>

            <p className="text-gray-600 leading-none">{comment.text}</p>
            {isCommentEditOpen && (
              <ModalEditComment
                onClose={() => setIsCommentEditOpen(false)}
                comment={commentToEdit}
              />
            )}
          </div>
        ))}
    </div>
  );
};

export default MessageComments;
