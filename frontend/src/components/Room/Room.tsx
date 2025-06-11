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

const Room: React.FC<RoomProps> = ({ chat }) => {
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
      chatId: chat.id,
    });
  }, [socket]);

  useEffect(() => {
    if (!chat || !user || !socket) return;
    console.log("<========>", chat);

    const handlePMS = (data) => {
      console.log("<===chat messages=====>", data.messages);
      if (data.messages.length === 0) return;
      if (data.chatId === chat.id) {
        setMessages(data.messages);
      }
    };
    const handleCMS = (data) => {
      console.log("<===new message=====>", data.data);
      setMessages((prev) => [...prev, data.data]);
    };

    const handleChatMessageError = (Error) => {
      console.log("<===error=====>", Error);
      setSuccessMessage("Something went wrong.", Error);
      setOpenModalMessage(true);
      setIsModalVisible(true);
      setTimeout(() => {
        setOpenModalMessage(false);
        setSuccessMessage("");
      }, 2000);
    };

    const handlenewChatMessage = (data) => {
      console.log("<====new chat message====>", data.data);
      setMessages((prev) => [...prev, data.data]);
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
  }, [chat, socket, user]);

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
      console.log("<==messageChat==>", messageChat);
      socket.emit("create_chat_message", {
        senderId: Number(user._id),
        receiverId: chat.otherParticipant.id,
        text: messageChat,
        chatId: chat.id,
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
    <div className={styles.room}>
      {isModalVisible && (
        <ModalMessage message={successMessage} open={openModalMessage} />
      )}
      <div className="border border-gray-400 rounded-md px-2 py-1 gap-2">
        {/* <div>chat id: {chat.id}</div> */}
        <div className="flex items-center gap-2 mb-4">
          {/* <span>{chat.otherParticipant.id}</span> */}
          <span>{chat.otherParticipant.userName}</span>
          <span>
            {chat.otherParticipant.avatarUrl && (
              <div className="rounded-full overflow-hidden ">
                <Image
                  src={chat.otherParticipant.avatarUrl}
                  alt="avatar"
                  width={20}
                  height={20}
                />
              </div>
            )}
          </span>
        </div>
        {/* <span>last message:</span>
        {chat.lastMessage ? (
          <span> {JSON.stringify(chat.lastMessage, null, 2)}</span>
        ) : (
          <span>==========</span>
        )} */}
        {messages.length > 0 ? (
          sortedMessages(messages).map((message: Message) => (
            <>
              {/* <p key={message}>{JSON.stringify(message, null, 2)}</p> */}
              <div
                key={message.id}
                className="border border-gray-400 bg-white rounded-md px-2 py-1 mb-2 gap-2"
              >
                {/* <p>{message.receiver.userName}</p>
                <p>{message.sender.userName}</p> */}
                <p className="text-xs text-gray-400">
                  {new Date(message.createdAt).toLocaleString("de-DE", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <h3>{message.text}</h3>
              </div>
            </>
          ))
        ) : (
          <p>no messages yet</p>
        )}
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
  );
};

export default Room;
