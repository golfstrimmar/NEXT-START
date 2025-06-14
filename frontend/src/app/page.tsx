"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import MessageList from "@/components/MessageList/MessageList";
import ModalAddEvent from "@/components/ModalAddEvent/ModalAddEvent";
import Button from "@/components/ui/Button/Button";
import { useSelector, useDispatch } from "react-redux";
import {
  setUsers,
  addUser,
  setOnlineUsers,
} from "@/app/redux/slices/authSlice";
import {
  setChats,
  addChat,
  deleteChat,
  clearChats,
} from "@/app/redux/slices/chatsSlice";
import { AnimatePresence } from "framer-motion";
import MessageType from "@/types/message";
import Chat from "@/types/chats";
import User from "@/types/user";
import dynamic from "next/dynamic";
import Room from "@/components/Room/Room";
import Chats from "@/components/Chats/Chats";
const ModalMessage = dynamic(
  () => import("@/components/ModalMessage/ModalMessage"),
  {
    ssr: false,
  }
);
export default function Home() {
  const dispatch = useDispatch();
  const [AddModalOpen, setAddModalOpen] = useState<boolean>(false);
  const socket: Socket = useSelector((state) => state.socket.socket);
  const user: User = useSelector((state) => state.auth.user);
  const users: User[] = useSelector((state) => state.auth.users);
  const chats: Chat[] = useSelector((state) => state.chats.chats);
  const onlineUsers: User[] = useSelector((state) => state.auth.onlineUsers);
  const comments = useSelector((state) => state.comments.comments);
  const usersLikedDisliked = useSelector(
    (state) => state.messages.usersLikedDisliked
  );
  const commentsLikedDisliked = useSelector(
    (state) => state.comments.commentsLikedDisliked
  );
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [openModalMessage, setOpenModalMessage] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [OpenChats, setOpenChats] = useState<boolean>(false);
  const [openChatId, setOpenChatId] = useState<number | null>(null);
  // -----------------------------------------

  useEffect(() => {
    if (!socket || !user) return;
    socket.emit("join", { senderId: Number(user._id) });
  }, [socket, user]);

  useEffect(() => {
    if (chats) {
      console.log("<==== chats====>", chats);
    }
  }, [chats]);

  useEffect(() => {
    if (onlineUsers) {
      console.log("<==== onlineUsers====>", onlineUsers);
    }
  }, [onlineUsers]);
  // -----------------------------------------
  useEffect(() => {
    if (!socket) {
      return;
    }

    const handlePrivateChatSuccess = (data) => {
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
    const handleNewPrivateChat = (data) => {
      console.log("-------New Private Chat:------", data.chat);
      dispatch(addChat(data.chat));
      setSuccessMessage("New Private Chat");
      setOpenModalMessage(true);
      setIsModalVisible(true);
      setTimeout(() => {
        setOpenModalMessage(false);
        setSuccessMessage("");
      }, 2000);
    };
    const handleDelitePrivateChat = (data) => {
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

    const handleCreatePrivateChatError = (data) => {
      console.log("<====error====>", data.message);
      setSuccessMessage("<====error====>", data.message);
      setOpenModalMessage(true);
      setIsModalVisible(true);
      setTimeout(() => {
        setOpenModalMessage(false);
        setSuccessMessage("");
      }, 2000);
    };
    const handleGetPrivateChatsError = (message, error) => {
      console.log("<====error====>", error);
      setSuccessMessage("<====error====>", message);
      setOpenModalMessage(true);
      setIsModalVisible(true);
      setTimeout(() => {
        setOpenModalMessage(false);
        setSuccessMessage("");
      }, 2000);
    };

    socket.on("newPrivateChat", handleNewPrivateChat);
    socket.on("createPrivateChatSuccess", handlePrivateChatSuccess);
    socket.on("deletePrivateChatSuccess", handleDelitePrivateChat);
    socket.on("createPrivateChatError", handleCreatePrivateChatError);
    socket.on("getPrivateChatsError", handleGetPrivateChatsError);

    return () => {
      socket.off("newPrivateChat", handleNewPrivateChat);
      socket.off("createPrivateChatSuccess", handlePrivateChatSuccess);
      socket.off("deletePrivateChatSuccess", handleDelitePrivateChat);
      socket.off("createPrivateChatError", handleCreatePrivateChatError);
      socket.off("getPrivateChatsError", handleGetPrivateChatsError);
    };
  }, [socket]);
  // -----------------------------------------

  // -----------------------------------------
  const handlerChat = (receiver) => {
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
  // -----------------------------------------
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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
  // -----------------------------------------

  return (
    <div className=" min-h-screen  font-[family-name:var(--font-geist-sans)]">
      {isModalVisible && (
        <ModalMessage message={successMessage} open={openModalMessage} />
      )}
      <div>
        <div className="border border-gray-500 p-2 mt-2 mb-2  rounded-md">
          <h3 className="font-bold text-lg  mb-2">Users</h3>
          {users &&
            users
              .filter((foo) => foo.id !== Number(user?._id))
              .map((foo, index) => {
                return (
                  <div key={index} className="flex gap-2 items-center mb-2">
                    {onlineUsers && onlineUsers?.includes(foo.id) ? (
                      <span className="text-green-500 rounded-full px-2 py-1 bg-green-100 text-xs">
                        online
                      </span>
                    ) : (
                      <span className="text-gray-500 rounded-full px-2 py-1 bg-gray-100 text-xs">
                        offline
                      </span>
                    )}

                    <h3 className="font-semibold"> {foo.userName}</h3>

                    <button
                      type="button"
                      onClick={() => {
                        handlerChat(foo.id);
                      }}
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
                        alt="Picture of the author"
                      />
                    </button>
                  </div>
                );
              })}
        </div>
        {user && chats && (
          <div className="border border-gray-500 p-2 mt-2 mb-2 rounded-md">
            <h3 className="font-bold text-lg">Private Chats</h3>

            {chats &&
              chats.length > 0 &&
              chats
                .filter((el) => el && el.id && el.otherParticipant)
                .map((el, index) => {
                  return (
                    <div
                      className="flex gap-2 items-center checkChat"
                      key={el.id}
                    >
                      <Room
                        chatRoom={el}
                        open={openChatId === el.id}
                        setOpenChatId={setOpenChatId}
                      />
                      <div
                        className=" border border-gray-500 px-2 mt-2 mb-2 rounded-md bg-green-300 inline-flex items-center gap-2 cursor-pointer"
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
                          alt="Picture of the author"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            socket.emit("delete_private_chat", {
                              chatId: el.id,
                              senderId: Number(user._id),
                            });
                          } catch (error) {
                            console.log(error);
                          }
                        }}
                        className=" cursor-pointer bg-red-200 hover:bg-red-500  w-8 h-8 rounded-full flex justify-center items-center  transition-colors duration-200 ease-in-out"
                      >
                        <Image
                          src="/assets/svg/cross.svg"
                          width={10}
                          height={10}
                          alt="Picture of the author"
                        />
                      </button>
                    </div>
                  );
                })}
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
        ></Button>
        <AnimatePresence>
          {AddModalOpen && (
            <ModalAddEvent onClose={() => setAddModalOpen(false)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
