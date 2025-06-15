"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import MessageList from "@/components/MessageList/MessageList";
import ModalAddEvent from "@/components/ModalAddEvent/ModalAddEvent";
import Button from "@/components/ui/Button/Button";
import { useSelector, useDispatch } from "react-redux";
import { addChat, deleteChat } from "@/app/redux/slices/chatsSlice";
import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Room from "@/components/Room/Room";
import type { RootState } from "@/app/redux/store"; // Импортируем тип RootState
import type { Chat } from "@/types/chats";
import type { User } from "@/types/user";

const ModalMessage = dynamic(
  () => import("@/components/ModalMessage/ModalMessage"),
  {
    ssr: false,
  }
);

// Тип для сокета (предполагаем, что Socket определён где-то в проекте)
interface Socket {
  emit: (event: string, data?: unknown) => void;
  on: (event: string, callback: (data: unknown) => void) => void;
  off: (event: string, callback: (data: unknown) => void) => void;
}

const Home: React.FC = () => {
  const dispatch = useDispatch();
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [openModalMessage, setOpenModalMessage] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [openChatId, setOpenChatId] = useState<number | null>(null);

  const socket = useSelector(
    (state: RootState) => state.socket.socket
  ) as Socket | null;
  const user = useSelector(
    (state: RootState) => state.auth.user
  ) as User | null;
  const users = useSelector((state: RootState) => state.auth.users) as User[];
  const chats = useSelector((state: RootState) => state.chats.chats) as Chat[];
  const onlineUsers = useSelector(
    (state: RootState) => state.auth.onlineUsers
  ) as number[];

  // Типизация данных сокета
  interface SocketChatData {
    chat: Chat;
    message?: string;
  }

  interface SocketDeleteChatData {
    chatId: number;
  }

  interface SocketErrorData {
    message: string;
  }
  // Мемоизация фильтрованных пользователей
  const filteredUsers = useMemo(
    () => users?.filter((foo) => foo.id !== Number(user?._id)) || [],
    [users, user]
  );

  // Мемоизация фильтрованных чатов
  const validChats = useMemo(
    () => chats?.filter((el) => el && el.id && el.otherParticipant) || [],
    [chats]
  );
  // Подключение к сокету при наличии socket и user
  useEffect(() => {
    if (!socket || !user) return;
    socket.emit("join", { senderId: Number(user._id) });
  }, [socket, user]);

  // Логирование чатов
  useEffect(() => {
    if (chats) {
      console.log("<==== chats====>", chats);
    }
  }, [chats]);

  // Логирование онлайн-пользователей
  useEffect(() => {
    if (onlineUsers) {
      console.log("<==== onlineUsers====>", onlineUsers);
    }
  }, [onlineUsers]);

  const handleChat = useCallback(
    (receiverId: number): void => {
      if (!socket || !user) {
        setSuccessMessage(
          "To create a private chat, you need to be logged in."
        );
        setOpenModalMessage(true);
        setIsModalVisible(true);
        setTimeout(() => {
          setOpenModalMessage(false);
          setSuccessMessage("");
        }, 2000);
        return;
      }
      try {
        socket.emit("create_private_chat", {
          senderId: Number(user._id),
          receiverId,
        });
      } catch (error) {
        console.error("Error creating chat:", error);
      }
    },
    [socket, user]
  );

  const handleDeleteChat = useCallback(
    (chatId: number): void => {
      if (!socket || !user) return;
      try {
        socket.emit("delete_private_chat", {
          chatId,
          senderId: Number(user._id),
        });
      } catch (error) {
        console.error("Error deleting chat:", error);
      }
    },
    [socket, user]
  );

  // Обработчики сокет-событий
  useEffect(() => {
    if (!socket) return;

    const handlePrivateChatSuccess = (data: SocketChatData) => {
      console.log("<====Private chat created Success====>", data.chat);
      if (data.message === "Private chat already exists") {
        console.log("<====Private chat already exists====>");
        setSuccessMessage("Private chat already exists.");
        setOpenModalMessage(true);
        setIsModalVisible(true);
        setTimeout(() => {
          setOpenModalMessage(false);
          setSuccessMessage("");
        }, 2000);
        return;
      }
      dispatch(addChat(data.chat));
      setSuccessMessage("Private chat created.");
      setOpenModalMessage(true);
      setIsModalVisible(true);
      setTimeout(() => {
        setOpenModalMessage(false);
        setSuccessMessage("");
      }, 2000);
    };

    const handleNewPrivateChat = (data: SocketChatData) => {
      console.log("<====New Private Chat:====>", data.chat);
      dispatch(addChat(data.chat));
      setSuccessMessage("New Private Chat");
      setOpenModalMessage(true);
      setIsModalVisible(true);
      setTimeout(() => {
        setOpenModalMessage(false);
        setSuccessMessage("");
      }, 2000);
    };

    const handleDeletePrivateChat = (data: SocketDeleteChatData) => {
      console.log("<====Private chat deleted====>", data.chatId);
      dispatch(deleteChat(data.chatId));
      setSuccessMessage("Private chat deleted.");
      setOpenModalMessage(true);
      setIsModalVisible(true);
      setTimeout(() => {
        setOpenModalMessage(false);
        setSuccessMessage("");
      }, 2000);
    };

    const handleCreatePrivateChatError = (data: SocketErrorData) => {
      console.log("<====error====>", data.message);
      setSuccessMessage(data.message);
      setOpenModalMessage(true);
      setIsModalVisible(true);
      setTimeout(() => {
        setOpenModalMessage(false);
        setSuccessMessage("");
      }, 2000);
    };

    const handleGetPrivateChatsError = (data: SocketErrorData) => {
      console.log("<====error====>", data.message);
      setSuccessMessage(data.message);
      setOpenModalMessage(true);
      setIsModalVisible(true);
      setTimeout(() => {
        setOpenModalMessage(false);
        setSuccessMessage("");
      }, 2000);
    };

    socket.on("newPrivateChat", handleNewPrivateChat);
    socket.on("createPrivateChatSuccess", handlePrivateChatSuccess);
    socket.on("deletePrivateChatSuccess", handleDeletePrivateChat);
    socket.on("createPrivateChatError", handleCreatePrivateChatError);
    socket.on("getPrivateChatsError", handleGetPrivateChatsError);

    return () => {
      socket.off("newPrivateChat", handleNewPrivateChat);
      socket.off("createPrivateChatSuccess", handlePrivateChatSuccess);
      socket.off("deletePrivateChatSuccess", handleDeletePrivateChat);
      socket.off("createPrivateChatError", handleCreatePrivateChatError);
      socket.off("getPrivateChatsError", handleGetPrivateChatsError);
    };
  }, [socket, dispatch]);

  // Обработчик создания чата
  const handlerChat = (receiver: number): void => {
    if (!socket || !user) {
      setSuccessMessage("To create a private chat, you must be logged in.");
      setOpenModalMessage(true);
      setIsModalVisible(true);
      setTimeout(() => {
        setOpenModalMessage(false);
        setSuccessMessage("");
      }, 2000);
      return;
    }
    try {
      socket.emit("create_private_chat", {
        senderId: Number(user._id),
        receiverId: receiver,
      });
    } catch (error) {
      console.log(error);
    }
  };

  // Закрытие чата при клике вне области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        event.target instanceof HTMLElement &&
        !event.target.closest(".room") &&
        !event.target.closest(".checkChat")
      ) {
        setOpenChatId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen font-[family-name:var(--font-geist-sans)]">
      {isModalVisible && (
        <ModalMessage message={successMessage} open={openModalMessage} />
      )}
      <div>
        <div className="border border-gray-500 p-2 mt-2 mb-2 rounded-md">
          <h3 className="font-bold text-lg mb-2">Users</h3>
          {users &&
            filteredUsers.map((foo, index) => (
              <div key={index} className="flex gap-2 items-center mb-2">
                {onlineUsers && onlineUsers.includes(foo.id) ? (
                  <span className="text-green-500 rounded-full px-2 py-1 bg-green-100 text-xs">
                    online
                  </span>
                ) : (
                  <span className="text-gray-500 rounded-full px-2 py-1 bg-gray-100 text-xs">
                    offline
                  </span>
                )}
                <h3 className="font-semibold">{foo.userName}</h3>
                {user && (
                  <button
                    type="button"
                    onClick={() => handleChat(foo.userId)}
                    className={`cursor-pointer bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full flex items-center gap-2 transition-colors duration-200 ease-in-out ${
                      chats &&
                      chats.some((el) => el.otherParticipant?.id === foo.id)
                        ? "hidden"
                        : ""
                    }`}
                  >
                    Create Private Chat with: {foo.userName}
                    <Image
                      src="/assets/svg/click.svg"
                      width={15}
                      height={15}
                      alt="Create chat"
                    />
                  </button>
                )}
              </div>
            ))}
        </div>
        {user && validChats.length > 0 && (
          <div className="border border-gray-500 p-2 mt-2 mb-2 rounded-md">
            <h3 className="font-bold text-lg">Private Chats</h3>
            {validChats.map((el) => (
              <div className="flex gap-2 items-center checkChat" key={el.id}>
                <Room
                  chatRoom={el}
                  open={openChatId === el.id}
                  setOpenChatId={setOpenChatId}
                />
                <div
                  className="border border-gray-500 px-2 mt-2 mb-2 rounded-md bg-green-300 inline-flex items-center gap-2 cursor-pointer"
                  onClick={() => {
                    setOpenChatId(openChatId === el.id ? null : el.id);
                  }}
                >
                  <p>{user?.userName || "Anonymous"}</p>
                  <span>—</span>
                  <p>{el.otherParticipant?.userName || "Unknown"}</p>
                  <Image
                    src="/assets/svg/click.svg"
                    width={15}
                    height={15}
                    alt="Open chat"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteChat(el.chatId)}
                  className="cursor-pointer bg-red-200 hover:bg-red-500 w-8 h-8 rounded-full flex justify-center items-center transition-colors duration-200 ease-in-out"
                >
                  <Image
                    src="/assets/svg/cross.svg"
                    width={10}
                    height={10}
                    alt="Delete chat"
                  />
                </button>
              </div>
            ))}
          </div>
        )}
        <MessageList />
        <Button
          buttonText="Add Message"
          buttonType="button"
          onClick={() => {
            if (user) {
              setAddModalOpen(true);
            } else {
              setSuccessMessage("For add message you need to be logged in.");
              setOpenModalMessage(true);
              setIsModalVisible(true);
              setTimeout(() => {
                setOpenModalMessage(false);
                setSuccessMessage("");
              }, 2000);
            }
          }}
        />
        <AnimatePresence>
          {addModalOpen && (
            <ModalAddEvent onClose={() => setAddModalOpen(false)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Home;
