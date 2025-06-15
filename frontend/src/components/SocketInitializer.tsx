"use client";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { useSelector, useDispatch } from "react-redux";
import { setSocket, disconnectSocket } from "@/app/redux/slices/socketSlice";
import {
  setChats,
  addChat,
  deleteChat,
  clearChats,
} from "@/app/redux/slices/chatsSlice";
import {
  setMessages,
  addMessage,
  setUsersLikedDisliked,
  updateMessage,
} from "@/app/redux/slices/messagesSlice";
import {
  setUsers,
  addUser,
  setOnlineUsers,
} from "@/app/redux/slices/authSlice";
import {
  setComments,
  addComment,
  setCommentsLikedDisliked,
} from "@/app/redux/slices/commentsSlice";
import Chat from "@/types/chats";
import User from "@/types/user";
const SocketInitializer: React.FC = () => {
  const user: User = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  useEffect(() => {
    const serverUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005";
    const socket = io(serverUrl, {
      transports: ["websocket"],
    });

    console.log("<====user====>", user);

    socket.on("connect", () => {
      console.log("+++++Connected to server with id:", socket.id);
      dispatch(setSocket(socket));
      socket.emit("get_messages");
      socket.emit("get_users");
      socket.emit("get_users_liked_disliked");
      socket.emit("get_comments");
      socket.emit("get_commets_liked_disliked");
      if (user) {
        socket.emit("get_private_chats", { senderId: Number(user._id) });
      }
    });

    // Получение всех сообщений
    socket.on("messages", (messages: any) => {
      dispatch(setMessages(messages));
    });

    socket.on("message_updated", (updatedMessage: any) => {
      dispatch(updateMessage(updatedMessage));
    });

    // Получение всех пользователей
    socket.on("users", (users: any) => {
      dispatch(setUsers(users.users));
      dispatch(setOnlineUsers(users.onlineUsers));
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

    socket.on("commets_liked_disliked", (comments: any) => {
      dispatch(setCommentsLikedDisliked(comments));
    });

    socket.on("connect_error", (error: any) => {
      console.error(
        "Connection error:",
        error instanceof Error ? error.message : error
      );
    });
    socket.on("onlineUsersUpdate", (data) => {
      dispatch(setOnlineUsers(data.onlineUsers));
    });
    const handleCreateComment = (comment: Comment) => {
      dispatch(addComment(comment));
      console.log("<==== New comment created ====>", comment);
    };

    socket.on("comment_created", handleCreateComment);

    socket.on("getPrivateChatsSuccess", (chats: Chat[]) => {
      dispatch(setChats(chats.chats));
    });

    socket.on("disconnect", () => {
      dispatch(disconnectSocket());
    });

    // Очистка
    return () => {
      socket.off("messages");
      socket.off("users");
      socket.off("new_user");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.off("registrationSuccess");
      socket.off("googleRegisterSuccess");
      socket.off("users_liked_disliked");
      socket.off("onlineUsersUpdate");
      socket.off("comment_created", handleCreateComment);
      socket.disconnect();
      dispatch(disconnectSocket());
    };
  }, [dispatch, user]);

  return null;
};

export default SocketInitializer;
