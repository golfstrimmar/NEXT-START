"use client";
import React, { useState, useEffect } from "react";
import { MessageType } from "@/types/message";
import { useSelector, useDispatch } from "react-redux";
import { deleteMessage, updateMessage } from "@/app/redux/slices/messagesSlice";
import { User } from "@/types/user";
import ModalEditMessage from "@/components/ModalEditMessage/ModalEditMessage";
import Image from "next/image";
import dynamic from "next/dynamic";
import Tab from "@/components/ui/Tab/Tab";

const ModalMessage = dynamic(
  () => import("@/components/ModalMessage/ModalMessage"),
  { ssr: false }
);

interface MessageProps {
  msg: MessageType;
}

const Message: React.FC<MessageProps> = ({ msg }) => {
  const dispatch = useDispatch();
  const user: User | null = useSelector((state: any) => state.auth.user);
  const socket: any = useSelector((state: any) => state.socket.socket);
  const usersLikedDisliked = useSelector(
    (state) => state.messages.usersLikedDisliked
  );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isAuthor, setIsAuthor] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [openModalMessage, setOpenModalMessage] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [usersLiked, setusersLiked] = useState<number[]>([]);
  const [usersDisliked, setusersDisliked] = useState<number[]>([]);
  // ------------------------------

  useEffect(() => {
    if (usersLikedDisliked) {
      console.log("<==== usersLikedDisliked====>", usersLikedDisliked);
      setusersLiked(
        usersLikedDisliked
          .filter((reaction: any) => reaction.messageId === msg.id)
          .filter((reaction: any) => reaction.reaction === "like")
          .map((reaction: any) => reaction.userName)
      );
      setusersDisliked(
        usersLikedDisliked
          .filter((reaction: any) => reaction.messageId === msg.id)
          .filter((reaction: any) => reaction.reaction === "dislike")
          .map((reaction: any) => reaction.userName)
      );
    }
  }, [usersLikedDisliked]);

  useEffect(() => {
    if (user?.userName === msg?.author) {
      setIsAuthor(true);
    }
  }, [user, msg]);

  useEffect(() => {
    if (socket) {
      const handleMessageLiked = (
        likedMessage: MessageType,
        userId: number
      ) => {
        if (likedMessage.id === msg.id) {
          dispatch(updateMessage(likedMessage));
        }
      };
      const handleMessageDisliked = (
        dislikedMessage: MessageType,
        userId: number
      ) => {
        if (dislikedMessage.id === msg.id) {
          dispatch(updateMessage(dislikedMessage));
        }
      };
      const handleMessageDeleted = (deletedMessage: MessageType) => {
        if (deletedMessage.id === msg.id) {
          dispatch(deleteMessage(deletedMessage.id));
          setSuccessMessage("Message deleted successfully.");
          setOpenModalMessage(true);
          setIsModalVisible(true);
          setTimeout(() => {
            setOpenModalMessage(false);
            setSuccessMessage("");
          }, 1500);
        }
      };

      socket.on("message_liked", handleMessageLiked);
      socket.on("message_disliked", handleMessageDisliked);
      socket.on("message_deleted", handleMessageDeleted);

      return () => {
        socket.off("message_liked", handleMessageLiked);
        socket.off("message_disliked", handleMessageDisliked);
        socket.off("message_deleted", handleMessageDeleted);
      };
    }
  }, [socket, dispatch, msg.id]);
  // -------------------------
  // -------------------------
  // -------------------------
  const handleLike = (id: number) => {
    if (socket && user?._id) {
      socket.emit("like_message", {
        messageId: Number(id),
        userId: user?._id,
        userName: user?.userName,
      });
      if (!usersLiked.includes(user?.userName)) {
        setusersLiked((prev) => [...prev, user?.userName]);
      } else {
        setSuccessMessage("You already liked this message.");
        setOpenModalMessage(true);
        setIsModalVisible(true);
        setTimeout(() => {
          setOpenModalMessage(false);
          setSuccessMessage("");
        }, 1500);
      }
      setusersDisliked((prev) => prev.filter((id) => id !== user?.userName));
    } else {
      console.error("Socket or user not available");
    }
  };

  const handleDisLike = (id: number) => {
    if (socket && user?._id) {
      socket.emit("dislike_message", {
        messageId: Number(id),
        userId: user?._id,
        userName: user?.userName,
      });
      if (!usersDisliked.includes(user?.userName)) {
        setusersDisliked((prev) => [...prev, user?.userName]);
      } else {
        setSuccessMessage("You already disliked this message.");
        setOpenModalMessage(true);
        setIsModalVisible(true);
        setTimeout(() => {
          setOpenModalMessage(false);
          setSuccessMessage("");
        }, 1500);
      }

      setusersLiked((prev) => prev.filter((id) => id !== user?.userName));
    } else {
      console.error("Socket or user not available");
    }
  };
  // ----------------------------
  // ----------------------------
  // ----------------------------
  const handleDelete = (id: number) => {
    if (socket?.connected) {
      socket.emit("delete_message", { id: Number(id) });
    }
  };

  const handleModalExitComplete = () => {
    setIsModalVisible(false);
  };

  return (
    <div>
      {isModalVisible && (
        <ModalMessage
          message={successMessage}
          open={openModalMessage}
          onExitComplete={handleModalExitComplete}
        />
      )}
      <div className="flex justify-between items-start">
        <span className="text-gray-500 text-xs">{msg.author}</span>
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
                width={15}
                height={15}
                alt="edit"
                onClick={() => setIsModalOpen(true)}
                className="cursor-pointer hover:scale-110 transition-transform duration-150"
              />
              <Image
                src="/assets/svg/cross.svg"
                width={15}
                height={15}
                alt="delete"
                className="cursor-pointer hover:scale-110 transition-transform duration-150"
                onClick={() => handleDelete(msg.id)}
              />
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-2 mt-4">
        <p className="text-gray-800 leading-none">{msg.text}</p>
        <div className="flex items-center gap-4">
          <div className="grid grid-cols-[1fr_25px] items-center gap-2">
            <Image
              src="/assets/svg/like.svg"
              width={15}
              height={15}
              alt="like"
              className="object-cover cursor-pointer"
              onClick={() => handleLike(msg.id)}
            />{" "}
            <Tab length={usersLiked.length} details={usersLiked} />
          </div>

          <div className="grid grid-cols-[1fr_25px] items-center gap-2">
            <div className="rotate-[180deg]">
              <Image
                src="/assets/svg/like.svg"
                width={15}
                height={15}
                alt="dislike"
                className="object-cover cursor-pointer"
                onClick={() => handleDisLike(msg.id)}
              />
            </div>
            <Tab length={usersDisliked.length} details={usersDisliked} />
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ModalEditMessage message={msg} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

export default Message;
