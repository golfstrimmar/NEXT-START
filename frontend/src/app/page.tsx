"use client";
import React, { useState, useEffect, use } from "react";
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
import { span } from "framer-motion/client";
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

  // const [onlineUsers, setOnlineUsers] = useState<number[]>([]);
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

  return (
    <div className=" min-h-screen  font-[family-name:var(--font-geist-sans)]">
      {isModalVisible && (
        <ModalMessage message={successMessage} open={openModalMessage} />
      )}
      <div>
        {/* <Image
          src="/assets/svg/home.svg"
          className="inline-block mr-2 w-8 h-8"
          width={30}
          height={30}
          alt="Picture of the author"
        ></Image>
        <h1 className="text-3xl font-semibold italic text-gray-800 text-center">
          Home
        </h1>
        <div className="w-1/4">
          <Image
            alt="IMG10"
            src="/assets/images/15.jpg"
            width="50"
            height="50"
          />
        </div>
        <div className="home-img relative aspect-[1.5/1] w-1/2 h-auto">
          <Image
            className="object-contain absolute"
            src="/assets/images/image.jpg"
            alt="Picture of the author"
            fill
          />
        </div> */}

        {users &&
          users
            .filter((foo) => foo.id !== Number(user?._id))
            .map((foo, index) => {
              return (
                <div key={index} className="flex gap-2">
                  {onlineUsers && onlineUsers?.includes(foo.id) ? (
                    <span className="text-green-500 rounded-full px-2 py-1 bg-green-100 text-xs">
                      online
                    </span>
                  ) : (
                    <span className="text-gray-500 rounded-full px-2 py-1 bg-gray-100 text-xs">
                      offline
                    </span>
                  )}
                  <p>id: {foo.id}</p>
                  <h3 className="font-semibold"> {foo.userName}</h3>

                  <button
                    type="button"
                    onClick={() => {
                      handlerChat(foo.id);
                    }}
                    className=" cursor-pointer"
                  >
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
        {user && chats && (
          <div className="border border-gray-500 p-2 mt-2 mb-2">
            <h3 className="font-bold text-lg">Private Chats:</h3>

            {chats &&
              chats.length > 0 &&
              chats
                .filter((el) => el && el.id && el.otherParticipant)
                .map((el, index) => {
                  return (
                    <div
                      key={el.id} // Используем el.id вместо index для уникальности
                      className="border border-gray-500 p-2 mt-2 mb-2 rounded-md bg-green-300"
                    >
                      <div className="flex items-center gap-2 ">
                        <p>Chat #{el.id}</p>
                        <p>{user?.userName || "Anonymous"}</p>
                        <span>—</span>
                        <p>{el.otherParticipant?.userName || "Unknown"}</p>
                      </div>
                      <Room chatRoom={el} />
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
