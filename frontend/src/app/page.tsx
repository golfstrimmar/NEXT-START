"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import MessageList from "@/components/MessageList/MessageList";
import ModalAddEvent from "@/components/ModalAddEvent/ModalAddEvent";
import Button from "@/components/ui/Button/Button";
import { useSelector } from "react-redux";
import { AnimatePresence } from "framer-motion";
import MessageType from "@/types/message";
import User from "@/types/user";

import ModalMessage from "@/components/ModalMessage/ModalMessage";

export default function Home() {
  const [AddModalOpen, setAddModalOpen] = useState<boolean>(false);
  const socket: Socket = useSelector((state) => state.socket.socket);
  const user: User = useSelector((state) => state.auth.user);
  const users: User[] = useSelector((state) => state.auth.users);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  return (
    <div className=" min-h-screen  font-[family-name:var(--font-geist-sans)]">
      {error && <ModalMessage message={error} open={showModal} />}
      <div>
        <Image
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
        </div>
        {users &&
          users.map((user) => {
            return (
              <div key={user.id}>
                <p>{user.userName}</p>
                <p>{user.email}</p>
              </div>
            );
          })}

        <MessageList />
        <Button
          buttonText="Add Message"
          onClick={() => {
            if (user) {
              setAddModalOpen(true);
            } else {
              setError("For add message you need to be logged in");
              setShowModal(true);
              setTimeout(() => {
                setShowModal(false);
                setError("");
              }, 1500);
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
