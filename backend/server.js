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
  socket.on("get_messages", async () => {
    try {
      const messages = await prisma.message.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
      });
      console.log("Send to client by Socket.io:", messages.length);
      socket.emit("messages", messages);
    } catch (error) {
      console.error("Error getting messages:", error);
      socket.emit("error", "Failed to get messages");
    }
  });
  // ------------
  socket.on("send_message", async (data) => {
    try {
      console.log("Received message:", data);
      const message = await prisma.message.create({
        data: {
          text: data.text,
          author: data.author || "Anonymous",
        },
      });
      console.log("Message saved:", message);
      io.emit("new_message", message);
    } catch (error) {
      console.error("Error saving message:", error);
      socket.emit("error", "Failed to save message");
    }
  });
  // -----------------
  socket.on("edit_message", async (data) => {
    try {
      console.log("Received edit message request:", data);

      const existingMessage = await prisma.message.findUnique({
        where: { id: data.id },
      });

      if (!existingMessage) {
        console.error("Message not found:", data.id);
        socket.emit("error", "Message not found");
        return;
      }
      console.log("Existing message:", existingMessage);
      if (existingMessage.author !== data.authorID) {
        console.error("Unauthorized edit attempt by:", data.author);
        socket.emit("error", "You are not authorized to edit this message");
        return;
      }

      const updatedMessage = await prisma.message.update({
        where: { id: data.id },
        data: { text: data.text },
      });

      console.log("Message updated:", updatedMessage);
      io.emit("message_updated", updatedMessage);
    } catch (error) {
      console.error("Error updating message:", error);
      socket.emit("error", "Failed to update message");
    }
  });
  // ------------------
  socket.on("find_user", async ({ id }) => {
    const userID = Number(id);
    try {
      const user = await prisma.user.findUnique({
        where: { id: userID },
      });
      if (!user) {
        socket.emit("UserFailed", {
          message: "User not found",
        });
        return;
      }

      socket.emit("UserSuccess", {
        id: user.id,
        userName: user.userName,
        email: user.email,
      });
    } catch (error) {
      console.error("Login error:", error);
      socket.emit("UserFailed", { message: "User not found" });
    }
  });
  // ------------------
  socket.on("get_users", async () => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          userName: true,
          email: true,
          avatarUrl: true,
          createdAt: true,
        },
      });
      console.log("Отправлено пользователей:", users.length);
      socket.emit("users", users);
    } catch (error) {
      console.error("Ошибка при получении пользователей:", error);
      socket.emit("error", "Не удалось загрузить пользователей");
    }
  });
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
