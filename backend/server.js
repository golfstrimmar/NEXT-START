const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

// Добавим middleware для логов
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Включим логирование запросов Prisma
prisma.$on("query", (e) => {
  console.log("Prisma Query:", e.query);
});

// Подключение WebSocket с обработкой ошибок
io.on("connection", (socket) => {
  console.log("👉 Клиент подключен:", socket.id);

  socket.on("send_message", async (data) => {
    try {
      console.log("Получено сообщение:", data);

      // Сохраняем сообщение в БД
      const message = await prisma.message.create({
        data: {
          text: data.text,
          author: data.author || "Anonymous",
        },
      });

      console.log("Сообщение сохранено в БД:", message);
      // Отправляем всем клиентам
      io.emit("new_message", message);
    } catch (error) {
      console.error("Ошибка при сохранении сообщения:", error);
      socket.emit("error", "Не удалось сохранить сообщение");
    }
  });
});

// Получение сообщений с обработкой ошибок
app.get("/messages", async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });
    console.log("Отправлено сообщений:", messages.length);
    res.json(messages);
  } catch (error) {
    console.error("Ошибка при получении сообщений:", error);
    res.status(500).json({ error: "Не удалось загрузить сообщения" });
  }
});

const PORT = process.env.PORT || 3001;

async function seedDatabase() {
  try {
    console.log("Проверка seed данных...");
    const messages = await prisma.message.findMany();
    console.log("Найдено сообщений в БД:", messages.length);

    if (messages.length === 0) {
      console.log("Добавление тестовых данных...");
      await prisma.message.createMany({
        data: [
          { text: "Сообщение из seed-функции", author: "System" },
          { text: "Ещё одно сообщение", author: "Admin" },
        ],
      });
      console.log("✅ Тестовые данные добавлены в БД!");
    }
  } catch (error) {
    console.error("Ошибка в seedDatabase:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запуск сервера
httpServer.listen(PORT, "0.0.0.0", async () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  try {
    await seedDatabase();
  } catch (error) {
    console.error("Ошибка при запуске сервера:", error);
  }
});

// Обработка завершения процесса
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit();
});
