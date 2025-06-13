import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";
const prisma = new PrismaClient();
import { OAuth2Client } from "google-auth-library";
const saltRounds = 10;
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// ====================================================
const app = express();
// ====================================================
import googleRegister from "./components/auth/googleRegister.js";
import handlerRegister from "./components/auth/handlerRegister.js";
import handlerLogin from "./components/auth/handlerLogin.js";
import googleLogin from "./components/auth/googleLogin.js";
import handlerSetPassword from "./components/auth/handlerSetPassword.js";
import handlerGetUsers from "./components/auth/handlerGetUsers.js";
import handlerFindUser from "./components/auth/handlerFindUser.js";
import handlerEditMessage from "./components/messenges/handlerEditMessage.js";
import handlerSendMessage from "./components/messenges/handlerSendMessage.js";
import handlerGetMessages from "./components/messenges/handlerGetMessages.js";
import handlerDeleteMessage from "./components/messenges/handlerDeleteMessage.js";
import handlerLikeMessage from "./components/messenges/handlerLikeMessage.js";
import handlerGetUsersLikedDisliked from "./components/messenges/handlerGetUsersLikedDisliked.js";
import handlerComments from "./components/comments/handlerComments.js";
import handlerGetCommentsLikeDislike from "./components/comments/handlerGetCommentsLikeDislike.js";
import handlerChatMessages from "./components/chats/handlerChatMessages.js";
import chatCreate from "./components/chats/chatCreate.js";
import getChats from "./components/chats/getChats.js";
import handleLogOut from "./components/auth/handleLogOut.js";
// ====================================================
// Настройка CORS с конкретными доменами
const corsOptions = {
  origin: [
    "http://localhost:3001", // Локальный фронтенд
    "https://chatneon.vercel.app", // Vercel фронтенд
  ],
  methods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
  // credentials: true, // Разрешает куки и авторизацию
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Request Origin:", req.headers.origin);
  console.log("Request Headers:", req.headers);
  next();
});
app.use(cors(corsOptions));
// app.options("*", cors(corsOptions));

const httpServer = createServer(app);

// Настройка CORS для Socket.io, синхронизированная с Express
const io = new Server(httpServer, {
  cors: {
    origin: corsOptions.origin, // Те же домены
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true, // Добавлено для поддержки куки
  },
});

// Логирование запросов
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("CORS headers:", res.getHeaders());
  next();
});

prisma.$on("query", (e) => {
  console.log("Prisma Query:", e.query);
});
// ------------
app.get("/messages", async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    console.log("Отправлено сообщений:", messages.length);
    res.json(messages);
  } catch (error) {
    console.error("Ошибка при получении сообщений:", error);
    res.status(500).json({ error: "Не удалось загрузить сообщения" });
  }
});

// WebSocket логика
io.on("connection", async (socket) => {
  console.log("👉Socket client:", socket.id);

  // ------------
  handlerGetMessages(socket, prisma);
  // ------------
  handlerSendMessage(io, socket, prisma);
  // -----------------
  handlerEditMessage(io, socket, prisma);
  // ------------------
  handlerFindUser(socket, prisma);
  // ------------------
  handlerGetUsers(socket, prisma, io);
  // ---------------------Register
  handlerRegister(socket, prisma, bcrypt, saltRounds);
  // ---------------------Google Register
  googleRegister(io, socket, googleClient, prisma);
  // ---------------------Set Password Register
  handlerSetPassword(socket, prisma, bcrypt, saltRounds);
  // ---------------------Login
  handlerLogin(socket, prisma, jwt, bcrypt, io);
  // --------------------- Google login
  googleLogin(socket, prisma, googleClient, jwt, io);
  // ---------------------
  handlerLikeMessage(socket, prisma, io);
  // ---------------------
  handlerGetUsersLikedDisliked(socket, prisma, io);
  // ---------------------
  handlerDeleteMessage(socket, prisma, io);
  // ---------------------
  handlerGetCommentsLikeDislike(socket, prisma, io);
  // ---------------------
  handlerComments(socket, prisma, io);
  // ---------------------
  handlerChatMessages(socket, prisma, io);
  // ---------------------
  chatCreate(socket, prisma, io);
  // ---------------------
  getChats(socket, prisma, io);
  // ---------------------
  handleLogOut(socket, prisma, jwt, bcrypt, io);
  // ---------------------
  // socket.on("disconnect", async () => {
  //   try {
  //     console.log(`====Socket disconnected, socket.id: ${socket.id}====`);

  //     // Находим пользователя по socketId
  //     const onlineUser = await prisma.onlineUser.findFirst({
  //       where: { socketId: socket.id },
  //     });

  //     // Если пользователь найден, удаляем его
  //     if (onlineUser) {
  //       await prisma.onlineUser.delete({
  //         where: { userId: onlineUser.userId },
  //       });
  //       console.log(`====User ${onlineUser.userId} disconnected====`);
  //     } else {
  //       console.warn(`No user found for socket.id: ${socket.id}`);
  //     }

  //     // Получаем обновлённый список онлайн-пользователей
  //     const onlineUsers = await prisma.onlineUser.findMany({
  //       select: { userId: true },
  //     });

  //     // Отправляем обновление всем клиентам
  //     io.emit("onlineUsersUpdate", {
  //       onlineUsers: onlineUsers.map((u) => u.userId.toString()),
  //     });
  //   } catch (error) {
  //     console.error("Error handling disconnect:", error);
  //   }
  // });
});

const PORT = process.env.PORT || 3005;

// Запуск сервера
httpServer.listen(PORT, "0.0.0.0", async () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});

// Обработка завершения процесса
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit();
});
