"use client";
import React, { useEffect, useState } from "react";
import styles from "./ModalAddEvent.module.scss";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Button from "@/components/ui/Button/Button";
import { useSelector } from "react-redux";
import Image from "next/image";
import Input from "@/components/ui/Input/Input";
import ModalMessage from "@/components/ModalMessage/ModalMessage";
import { Socket } from "dgram";
import { useRouter, useParams, usePathname } from "next/navigation";
import { User } from "@/types/user";
// ----------------------------

interface Message {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}
const ModalAddEvent = ({ onClose }) => {
  const user: User = useSelector((state) => state.auth.user);
  const router = useRouter();
  const socket: Socket = useSelector((state) => state.socket.socket);
  const [NewMessage, setNewMessage] = useState<Message>({
    id: "",
    text: "",
    author: "",
    createdAt: "",
  });
  const [text, setText] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // ----------------------------

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [router, user]);

  useEffect(() => {
    if (NewMessage) {
      console.log("<==== NewMessage====>", NewMessage);
      setNewMessage((prev) => {
        return {
          ...prev,
          author: user?.userName,
          authorID: Number(user?._id),
          text: text,
        };
      });
    }
  }, [text]);
  // ----------------------------
  const handleCreateMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (NewMessage.text === "") {
      console.log("<==== Text is required====>");
      setError("Text is required");
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        setError("");
      }, 1500);
      return;
    }

    console.log("<==== NewMessage====>", NewMessage);
    socket.emit("send_message", NewMessage);
    socket.on("new_message", (message) => {
      console.log("<====New message from server====>", message);
      onClose();
    });
    // onClose();
  };
  // ----------------------------

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-[100vw] h-[100vh] fixed top-0 pt-20 sm:pt-0 left-0 flex justify-center items-center bg-[rgba(0,0,0,.95)] z-100 p-4 "
      >
        <motion.div
          initial={{ scale: 0, y: 0 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-gray-300 rounded-lg p-1 sm:p-4 "
        >
          {error && <ModalMessage message={error} open={showModal} />}
          <Image
            onClick={() => onClose()}
            src="/assets/svg/cross.svg"
            alt="cross"
            width={24}
            height={24}
            className="absolute top-6 right-10 cursor-pointer z-50 border border-gray-300 rounded-full p-1 hover:bg-gray-200 transition-all duration-200"
          />
          <form
            // onSubmit={handleCreateMessage}
            className="w-full relative mb-8 bg-white border border-gray-300 rounded-lg p-1 sm:p-4"
          >
            <h2 className="text-2xl font-semibold mb-4">
              User: {user?.userName}
            </h2>
            <div className="mb-4">
              <Input
                typeInput="textarea"
                id="text"
                data="Text"
                name="text"
                value={NewMessage.text}
                onChange={(e) => setText(e.target.value)}
                required
              />
            </div>
            <Button
              buttonText="Create Message"
              buttonType="submit"
              onClick={(e) => handleCreateMessage(e)}
            />
          </form>{" "}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModalAddEvent;
