"use client";
import React, { useEffect, useState } from "react";
import styles from "./Room.module.scss";
import Chat from "@/types/chats";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import dynamic from "next/dynamic";
import { div } from "framer-motion/client";
const ModalMessage = dynamic(
  () => import("@/components/ModalMessage/ModalMessage"),
  {
    ssr: false,
  }
);
interface RoomProps {
  chat: Chat;
  open: boolean;
}

interface Message {
  id: number;
  chatId: number;
  text: string;
  receiver: {
    id: number;
    userName: string;
    avatar: string;
  };
  sender: {
    id: number;
    userName: string;
    avatar: string;
  };
  createdAt: string;
}

const Room: React.FC<RoomProps> = ({ chatRoom, open, setOpenChatId }) => {
  const dispatch = useDispatch();
  const socket: Socket = useSelector((state) => state.socket.socket);
  const user: User = useSelector((state) => state.auth.user);
  const [messages, setMessages] = useState<string[]>([]);
  const [messageChat, setMessageChat] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [openModalMessage, setOpenModalMessage] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  //  ---------------------------------
  useEffect(() => {
    if (!socket && !user) return;
    socket.emit("join", {
      senderId: Number(user._id),
    });
  }, [socket, user]);

  useEffect(() => {
    socket?.emit("get_private_messages", {
      senderId: Number(user._id),
      chatId: chatRoom.id,
    });
  }, [socket]);

  useEffect(() => {
    if (!chatRoom || !user || !socket) return;

    const handlePMS = (data) => {
      if (data.messages.length === 0) return;
      if (data.chatId === chatRoom.id) {
        setMessages(data.messages);
      }
    };
    const handleCMS = (data) => {
      if (data.data.chatId === chatRoom.id) {
        setMessages((prev) => [...prev, data.data]);
      }
    };

    const handleChatMessageError = (Error) => {
      setSuccessMessage("Something went wrong.", Error);
      setOpenModalMessage(true);
      setIsModalVisible(true);
      setTimeout(() => {
        setOpenModalMessage(false);
        setSuccessMessage("");
      }, 2000);
    };

    const handlenewChatMessage = (data) => {
      if (data.data.chatId === chatRoom.id) {
        setMessages((prev) => [...prev, data.data]);
      }
    };

    socket.on("getPrivateMessagesSuccess", handlePMS);
    socket.on("createChatMessageSuccess", handleCMS);
    socket.on("createChatMessageError", handleChatMessageError);
    socket.on("newChatMessage", handlenewChatMessage);

    return () => {
      setMessageChat("");
      socket.off("getPrivateMessagesSuccess", handlePMS);
      socket.off("createChatMessageSuccess", handleCMS);
      socket.off("createChatMessageError", handleChatMessageError);
      socket.off("newChatMessage", handlenewChatMessage);
    };
  }, [chatRoom, socket, user]);

  //  ---------------------------------

  const sortedMessages = (messages: Message[]) => {
    const sorted = messages.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    return sorted;
  };
  //  ---------------------------------
  const handleAddChatMessage = () => {
    if (messageChat !== "") {
      socket.emit("create_chat_message", {
        senderId: Number(user._id),
        receiverId: chatRoom.otherParticipant.id,
        text: messageChat,
        chatId: chatRoom.id,
      });
      setMessageChat("");
    } else {
      setSuccessMessage("Text is required.");
      setOpenModalMessage(true);
      setIsModalVisible(true);
      setTimeout(() => {
        setOpenModalMessage(false);
        setSuccessMessage("");
      }, 2000);
    }
  };
  //  ---------------------------------

  return (
    <div
      className={`room fixed bg-blue-300  w-full sm:w-[500px]  h-full top-[64px] z-20 transition-all duration-300 bg-slate-300 border border-gray-400 rounded-md ${
        open ? "right-0" : "right-[-100%]"
      }`}
    >
      {isModalVisible && (
        <ModalMessage message={successMessage} open={openModalMessage} />
      )}
      <Image
        src="/assets/svg/cross-com.svg"
        width={15}
        height={15}
        alt="Picture of the author"
        onClick={() => setOpenChatId(null)}
        className="m-2 cursor-pointer"
      />
      <div className=" px-2 py-1 gap-2">
        {messages.length > 0 ? (
          sortedMessages(messages).map((message: Message) => (
            <div
              key={message.id}
              className={`border border-gray-400  rounded-md px-2 py-1 mb-2 gap-2 ${
                Number(user._id) === Number(message.sender.id)
                  ? "ml-6 bg-gray-200"
                  : "bg-white"
              }`}
            >
              <div className="flex  items-center gap-2">
                {Number(user._id) === Number(message.sender.id) ? (
                  <span className="text-green-600 text-sm">
                    {user.userName}
                  </span>
                ) : (
                  <span className="text-green-600  text-sm">
                    {chatRoom.otherParticipant.userName}
                  </span>
                )}

                <p className={`text-xs text-gray-400 `}>
                  {new Date(message.createdAt).toLocaleString("de-DE", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <h3>{message.text}</h3>
            </div>
          ))
        ) : (
          <p className="text-blue-600 text-sm">no messages yet</p>
        )}
        <h3 className="mt-4 text-slate-400 text-sm">Send a message</h3>
        <div className="flex justify-between">
          <form
            action=""
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleAddChatMessage();
            }}
          >
            <input
              type="text"
              value={messageChat}
              onChange={(e) => {
                setMessageChat(e.target.value);
              }}
              className="bg-white border border-gray-400 rounded-md px-2 py-1"
            />
            <button
              type="submit"
              className="text-white bg-blue-500 hover:bg-blue-600 transition-colors cursor-pointer rounded-md px-2 py-1"
            >
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Room;
