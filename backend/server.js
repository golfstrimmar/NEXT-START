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

  // ---------------------
  // Google регистрация
  socket.on("googleRegister", async ({ token }) => {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload) {
        socket.emit("registrationError", { message: "Invalid Google token" });
        return;
      }

      const { email, name, sub: googleId, picture: avatarUrl } = payload;
      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { googleId }] },
      });

      if (existingUser) {
        socket.emit("registrationError", {
          message: "User already registered",
        });
        return;
      }

      socket.emit("requirePassword", {
        email,
        userName: name,
        googleId,
        avatarUrl,
      });
    } catch (error) {
      console.error("Google registration error:", error);
      socket.emit("registrationError", {
        message: "Google registration failed",
      });
    }
  });

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
