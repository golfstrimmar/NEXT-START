"use client";
import React from "react";
import styles from "./Chats.module.scss";

interface ChatsProps {
  open: boolean;
}

const Chats: React.FC<ChatsProps> = ({ open }) => {
  return (
    <div
      className={`fixed bg-blue-300 w-[500px] h-full top-[64px] z-20 transition-all duration-300  ${
        open ? "right-0" : "right-[-500px]"
      }`}
    >
      <div className={styles["chats__item"]}>Chats</div>
      <div className={styles["chats__item"]}></div>
      <div className={styles["chats__item"]}></div>
    </div>
  );
};

export default Chats;
