const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();
const prisma = new PrismaClient();

const { OAuth2Client } = require("google-auth-library");
const saltRounds = 10;
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// ====================================================
import googleRegister from "./components/googleRegister.js";
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

  socket.on("send_message", async (data) => {
    try {
      console.log("Получено сообщение:", data);
      const message = await prisma.message.create({
        data: {
          text: data.text,
          author: data.author || "Anonymous",
        },
      });
      console.log("Сообщение сохранено в БД:", message);
      io.emit("new_message", message);
    } catch (error) {
      console.error("Ошибка при сохранении сообщения:", error);
      socket.emit("error", "Не удалось сохранить сообщение");
    }
  });

  // ---------------------Google регистрация
  googleRegister(io, socket);
  // ---------------------
  // Установка пароля для Google
  socket.on(
    "setPassword",
    async ({ email, password, userName, googleId, avatarUrl }) => {
      try {
        const existingUser = await prisma.user.findFirst({
          where: { OR: [{ email }, { googleId }, { username: userName }] },
        });
        if (existingUser) {
          socket.emit("registrationError", {
            message: "User already exists",
          });
          return;
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const user = await prisma.user.create({
          data: {
            username: userName,
            email,
            password: hashedPassword,
            googleId,
            avatarUrl,
          },
        });

        socket.emit("googleRegisterSuccess", {
          message: "Google registration successful",
          user: { id: user.id, username: user.username },
        });
      } catch (error) {
        console.error("Set password error:", error);
        socket.emit("registrationError", { message: "Failed to set password" });
      }
    }
  );
  // ---------------------
  socket.on("register", async ({ username, email, password }) => {
    try {
      // Проверка существования пользователя
      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
      });
      if (existingUser) {
        socket.emit("registrationError", {
          message:
            existingUser.email === email
              ? "Email already registered"
              : "Username already taken",
        });
        return;
      }

      // Хеширование пароля
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Создание пользователя
      const user = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
        },
      });

      socket.emit("registrationSuccess", {
        message: "Registration successful",
        user: { id: user.id, username: user.username },
      });
    } catch (error) {
      console.error("Registration error:", error);
      socket.emit("registrationError", { message: "Registration failed" });
    }
  });
  // ---------------------
  socket.on("login", async ({ email, password }) => {
    try {
      // Поиск пользователя
      const user = await prisma.user.findUnique({
        where: { email },
      });
      if (!user || !user.password) {
        socket.emit("loginError", {
          message: "Invalid email or password",
        });
        return;
      }

      // Проверка пароля
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        socket.emit("loginError", {
          message: "Invalid email or password",
        });
        return;
      }

      // Генерация JWT-токена
      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        process.env.JWT_SECRET || "your_jwt_secret",
        { expiresIn: "1h" }
      );

      // Формирование ответа
      socket.emit("loginSuccess", {
        message: "Login successful",
        user: {
          _id: user.id.toString(),
          userName: user.username,
          email: user.email,
          passwordHash: user.password,
          avatar: user.avatarUrl || "",
          googleId: user.googleId || "",
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.createdAt.toISOString(),
          __v: 0,
        },
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      socket.emit("loginError", { message: "Login failed" });
    }
  });
  // ---------------------
  // Google логин
  socket.on("googleLogin", async ({ token }) => {
    try {
      // Проверка Google-токена
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload) {
        socket.emit("googleloginError", {
          message: "Invalid Google token",
          error: "Token verification failed",
        });
        return;
      }

      const { email, name, sub: googleId, picture: avatarUrl } = payload;
      // Поиск пользователя
      let user = await prisma.user.findFirst({
        where: { OR: [{ googleId }, { email }] },
      });
      console.log("<====user====>", user);
      console.log("<====user password====>", user.password);
      const isPasswordValid = user.password.length > 0 ? true : false;
      console.log("<====isPasswordValid====>", isPasswordValid);
      if (!user) {
        socket.emit("loginError", {
          message: "Invalid email or password",
        });
        return;
      }
      if (!isPasswordValid) {
        socket.emit("requirePassword", {
          email,
          userName: name,
          googleId,
          avatarUrl,
        });
        return;
      }
      // Генерация JWT-токена
      const jwtToken = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        process.env.JWT_SECRET || "your_jwt_secret",
        { expiresIn: "1h" }
      );

      // Ответ
      socket.emit("googleLoginSuccess", {
        message: "Google login successful",
        user: {
          _id: user.id.toString(),
          userName: user.username,
          email: user.email,
          passwordHash: user.password || "",
          avatar: user.avatarUrl || "",
          googleId: user.googleId || "",
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.createdAt.toISOString(),
          __v: 0,
        },
        token: jwtToken,
      });
    } catch (error) {
      console.error("Google login error:", error);
      socket.emit("googleloginError", {
        message: "Google login failed",
        error: error.message || "Unknown error",
      });
    }
  });
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

// import express from "express";
// import { createServer } from "http";
// import { Server } from "socket.io";
// import http from "http";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import { connectDB } from "./config/db.js";
// import cors from "cors";
// import dotenv from "dotenv";
// import axios from "axios";
// import { OAuth2Client } from "google-auth-library";

// const app = express();
// connectDB();
// dotenv.config();
// const httpServer = createServer(app);
// const io = new Server(httpServer);

// const server = http.createServer(app);
// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// // ==============================================

// // import Article from "./models/Article.js";
// // import articleHandler from "./components/articleHandler.js";
// // import articleEditHandler from "./components/articleEditHandler.js";
// import googleRegister from "./components/googleRegister.js";
// import handlerRegister from "./components/handlerRegister.js";
// import handlerLogin from "./components/handlerLogin.js";
// import googleLogin from "./components/googleLogin.js";
// import handlerSetPassword from "./components/handlerSetPassword.js";
// import User from "./models/User.js";

// // ==============================================

// app.get("/", (req, res) => {
//   res.send("Start Backend");
// });
// // ----------------------------
// app.get("/auth/google/callback", async (req, res) => {
//   const { code } = req.query;
//   if (!code) return res.status(400).send("Code is required");
//   try {
//     const response = await axios.post("https://oauth2.googleapis.com/token", {
//       code,
//       client_id: process.env.GOOGLE_CLIENT_ID,
//       client_secret: process.env.GOOGLE_CLIENT_SECRET,
//       redirect_uri: "http://localhost:5001/auth/google/callback",
//       grant_type: "authorization_code",
//     });
//     const { access_token, id_token } = response.data;
//     const ticket = await client.verifyIdToken({
//       idToken: id_token,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });
//     const payload = ticket.getPayload();
//     const email = payload.email;
//     const userName = payload.name;
//     const googleId = payload.sub;
//     const avatarUrl = payload.picture || null;
//     let user = await User.findOne({ email });
//     if (!user) {
//       const avatarBase64 = avatarUrl
//         ? await downloadAvatarAsBase64(avatarUrl)
//         : null;
//       user = new User({ email, userName, avatar: avatarBase64, googleId });
//       await user.save();
//     }
//     const jwtToken = jwt.sign(
//       { userId: user._id, email: user.email },
//       process.env.JWT_SECRET,
//       { expiresIn: "10h" }
//     );
//     res.redirect(`http://localhost:3001/dashboard?token=${jwtToken}`);
//   } catch (error) {
//     console.error("Google callback error:", error);
//     res.status(500).send("Authentication failed");
//   }
// });
// const downloadAvatarAsBase64 = async (url) => {
//   try {
//     const response = await axios.get(url, { responseType: "arraybuffer" });
//     return `data:image/jpeg;base64,${Buffer.from(response.data).toString(
//       "base64"
//     )}`;
//   } catch (error) {
//     console.error("Failed to download avatar:", error);
//     return null;
//   }
// };
// // ----------------------------
// io.on("connection", (socket) => {
//   console.log("Socket connected:", socket.id);

//   googleRegister(io, socket);
//   handlerRegister(io, socket);
//   handlerLogin(io, socket);
//   googleLogin(io, socket);
//   handlerSetPassword(io, socket);

//   socket.on("disconnect", () => {
//     console.log(`Client disconnected: ${socket.id}`);
//   });
// });
// const PORT = process.env.PORT || 5001;
// httpServer.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
