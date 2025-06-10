"use client";
import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import MessageList from "@/components/MessageList/MessageList";
import ModalAddEvent from "@/components/ModalAddEvent/ModalAddEvent";
import Button from "@/components/ui/Button/Button";
import { useSelector } from "react-redux";
import { AnimatePresence } from "framer-motion";
import MessageType from "@/types/message";
import Chat from "@/types/chats";
import User from "@/types/user";
import dynamic from "next/dynamic";
import Room from "@/components/Room/Room";
const ModalMessage = dynamic(
  () => import("@/components/ModalMessage/ModalMessage"),
  {
    ssr: false,
  }
);
export default function Home() {
  const [AddModalOpen, setAddModalOpen] = useState<boolean>(false);
  const socket: Socket = useSelector((state) => state.socket.socket);
  const user: User = useSelector((state) => state.auth.user);
  const users: User[] = useSelector((state) => state.auth.users);
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
  const [chats, setChats] = useState<Chat[]>([]);
  // -----------------------------------------
  useEffect(() => {
    if (!socket) {
      return;
    }
    try {
      socket.emit("get_private_chats", { senderId: Number(user._id) });
    } catch (error) {
      console.log(error);
    }
  }, [socket]);

  // -----------------------------------------
  useEffect(() => {
    if (!socket) {
      return;
    }

    const handlePrivateChat = (data) => {
      console.log("<====Private chat created====>", data.chat);
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
      setSuccessMessage("Private chat created.");
      setOpenModalMessage(true);
      setIsModalVisible(true);
      setTimeout(() => {
        setOpenModalMessage(false);
        setSuccessMessage("");
      }, 2000);
      setChats((prevChats) => [...prevChats, data.chat]);
    };
    const handlegetPrivateChats = (data) => {
      console.log("<====Private chats====>", data.chats);
      setChats(data.chats);
    };

    const handleDelitePrivateChat = (data) => {
      console.log("<====Private chat deleted====>", data.chatId);
      setSuccessMessage("Private chat deleted.");
      setOpenModalMessage(true);
      setIsModalVisible(true);
      setTimeout(() => {
        setOpenModalMessage(false);
        setSuccessMessage("");
      }, 2000);
      setChats((prevChats) =>
        prevChats.filter((chat) => chat.id !== data.chatId)
      );
    };

    socket.on("createPrivateChatSuccess", handlePrivateChat);
    socket.on("getPrivateChatsSuccess", handlegetPrivateChats);
    socket.on("deletePrivateChatSuccess", handleDelitePrivateChat);
    return () => {
      socket.off("createPrivateChatSuccess", handlePrivateChat);
      socket.off("getPrivateChatsSuccess", handlegetPrivateChats);
      socket.off("deletePrivateChatSuccess", handleDelitePrivateChat);
    };
  }, [socket]);
  // -----------------------------------------

  // -----------------------------------------
  const handlerChat = (receiver) => {
    try {
      socket.emit("create_private_chat", {
        senderId: user._id,
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
            .map((foo) => {
              return (
                <div key={foo.id} className="flex gap-2">
                  <p>id: {foo.id}</p>
                  <h3 className="font-semibold">userName: {foo.userName}</h3>
                  <p className="text-gray-400 text-sm">email: {foo.email}</p>
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
              chats.map((foo) => {
                return (
                  <div key={foo.id} className="mb-4">
                    <div className="flex gap-2">
                      {/* <p>Chat id:{foo.id}</p>
                      <p>Other participant id:{foo.otherParticipant.id}</p>
                      <p>Name:{foo.otherParticipant.userName}</p> */}
                      {/* <p>{JSON.stringify(foo.lastMessage, null, 2)}</p> */}
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            socket.emit("delete_private_chat", {
                              chatId: foo.id,
                              senderId: Number(user._id),
                            });
                          } catch (error) {
                            console.log(error);
                          }
                        }}
                        className=" cursor-pointer"
                      >
                        <Image
                          src="/assets/svg/cross.svg"
                          width={15}
                          height={15}
                          alt="Picture of the author"
                        />
                      </button>
                    </div>
                    <Room chat={foo} />
                  </div>
                );
              })}
          </div>
        )}
        {/* <div className="border border-gray-500 p-2 mt-2 mb-2">
          <h3>users Liked Disliked:</h3>
          {usersLikedDisliked &&
            usersLikedDisliked.map((foo) => {
              return (
                <div key={foo.id} className="flex gap-2">
                  <p>userId:{foo.userId}</p>
                  <p>messageId:{foo.messageId}</p>
                  <p>reaction:{foo.reaction}</p>
                </div>
              );
            })}
        </div>
        <div className="border border-gray-500 p-2 mt-2 mb-2">
          <h3>comments Liked Disliked:</h3>
          {commentsLikedDisliked &&
            commentsLikedDisliked.map((foo) => {
              return (
                <div key={foo.id} className="flex gap-2">
                  <p>userId:{foo.userId}</p>
                  <p>messageId:{foo.messageId}</p>
                  <p>reaction:{foo.reaction}</p>
                </div>
              );
            })}
        </div>
        <div className="border border-gray-500 p-2 mt-2 mb-2">
          <h3>comments:</h3>
          {comments &&
            comments.map((foo) => {
              return (
                <div key={foo.id} className="flex gap-2">
                  <p>id:{foo.id}</p>
                  <p>messageId:{foo.messageId}</p>
                  <p>userId:{foo.userId}</p>
                  <p>userName:{foo.userName}</p>
                  <p>likes:{foo.likes}</p>
                  <p>dislikes:{foo.dislikes}</p>
                </div>
              );
            })}
        </div> */}

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
