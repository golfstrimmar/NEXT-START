// const express = require("express");
// const { createServer } = require("http");
// const { Server } = require("socket.io");
// const { PrismaClient } = require("@prisma/client");
// const cors = require("cors");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const app = express();
// const prisma = new PrismaClient();

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
import googleRegister from "./components/googleRegister.js";
import handlerRegister from "./components/handlerRegister.js";
import handlerLogin from "./components/handlerLogin.js";
import googleLogin from "./components/googleLogin.js";
import handlerSetPassword from "./components/handlerSetPassword.js";
import handlerGetUsers from "./components/handlerGetUsers.js";
import handlerFindUser from "./components/handlerFindUser.js";
import handlerEditMessage from "./components/handlerEditMessage.js";
import handlerSendMessage from "./components/handlerSendMessage.js";
import handlerGetMessages from "./components/handlerGetMessages.js";
import handlerDeleteMessage from "./components/handlerDeleteMessage.js";
import handlerLikeMessage from "./components/handlerLikeMessage.js";
import handlerGetUsersLikedDisliked from "./components/handlerGetUsersLikedDisliked.js";
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
io.on("connection", (socket) => {
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
  handlerGetUsers(socket, prisma);
  // ---------------------Register
  handlerRegister(socket, prisma, bcrypt, saltRounds);
  // ---------------------Google Register
  googleRegister(io, socket, googleClient, prisma);
  // ---------------------Set Password Register
  handlerSetPassword(socket, prisma, bcrypt, saltRounds);
  // ---------------------Login
  handlerLogin(socket, prisma, jwt, bcrypt);
  // --------------------- Google login
  googleLogin(socket, prisma, googleClient, jwt);
  // ---------------------
  handlerLikeMessage(socket, prisma, io);
  // ---------------------
  handlerGetUsersLikedDisliked(socket, prisma);
  // ---------------------
  handlerDeleteMessage(socket, prisma);
  // ---------------------
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
