"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { setSocket, disconnectSocket } from "@/app/redux/slices/socketSlice";
import {
  setMessages,
  addMessage,
  setUsersLikedDisliked,
  deleteMessage,
} from "@/app/redux/slices/messagesSlice";
import { setUsers, addUser } from "@/app/redux/slices/authSlice";
import { setComments, addComment } from "@/app/redux/slices/commentsSlice";

const SocketInitializer: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const serverUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005";
    const socket = io(serverUrl, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Connected to server with id:", socket.id);
      dispatch(setSocket(socket));
      socket.emit("get_messages");
      socket.emit("get_users");
      socket.emit("get_users_liked_disliked");
      socket.emit("get_comments");
    });

    // Получение всех сообщений
    socket.on("messages", (messages: any) => {
      dispatch(setMessages(messages));
    });

    // Получение нового сообщения
    socket.on("new_message", (newMessage: any) => {
      dispatch(addMessage(newMessage));
    });

    // Получение всех пользователей
    socket.on("users", (users: any) => {
      dispatch(setUsers(users));
    });

    // Получение нового пользователя
    socket.on("new_user", (newUser: any) => {
      dispatch(addUser(newUser));
    });

    socket.on("users_liked_disliked", (users: any) => {
      dispatch(setUsersLikedDisliked(users));
    });
    socket.on("registrationSuccess", (newUser: any) => {
      dispatch(addUser(newUser.user)); // Берем user из объекта события
    });

    socket.on("googleRegisterSuccess", (newUser: any) => {
      dispatch(addUser(newUser.user)); // Берем user из объекта события
    });

    socket.on("comments", (comments: any) => {
      dispatch(setComments(comments));
    });

    socket.on("comment_created", (comment: any) => {
      dispatch(addComment(comment));
    });

    socket.on("connect_error", (error: any) => {
      console.error(
        "Connection error:",
        error instanceof Error ? error.message : error
      );
    });

    socket.on("disconnect", () => {
      dispatch(disconnectSocket());
    });

    // Очистка
    return () => {
      socket.off("messages");
      socket.off("new_message");
      socket.off("users");
      socket.off("new_user");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.off("registrationSuccess");
      socket.off("googleRegisterSuccess");
      socket.off("users_liked_disliked");
      socket.disconnect();
      dispatch(disconnectSocket());
    };
  }, [dispatch]);

  return null;
};

export default SocketInitializer;
