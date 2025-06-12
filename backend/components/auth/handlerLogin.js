export default (socket, prisma, jwt, bcrypt, io) => {
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
        { id: user.id, userName: user.userName, email: user.email },
        process.env.JWT_SECRET || "your_jwt_secret",
        { expiresIn: "1h" }
      );
      // Добавляем/обновляем в OnlineUser
      await prisma.onlineUser.upsert({
        where: { userId: user.id },
        update: {
          socketId: socket.id,
          lastActive: new Date(),
        },
        create: {
          userId: user.id,
          socketId: socket.id,
          lastActive: new Date(),
        },
      });

      // Присоединяем пользователя к комнате
      socket.join(`user_${user.id}`);

      const onlineUsers = await prisma.onlineUser.findMany({
        select: { userId: true },
      });
      console.log(
        "<====onlineUsers login====>",
        onlineUsers.map((u) => u.userId)
      );
      io.emit("onlineUsersUpdate", {
        onlineUsers: onlineUsers.map((u) => u.userId),
      });
      // Формирование ответа
      socket.emit("loginSuccess", {
        message: "Login successful",
        user: {
          _id: user.id.toString(),
          userName: user.userName,
          email: user.email,
          passwordHash: user.password,
          avatar: user.avatarUrl || "",
          googleId: user.googleId || "",
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.createdAt.toISOString(),
          __v: 0,
        },
        token,
        onlineUsers: onlineUsers.map((u) => u.userId),
      });
    } catch (error) {
      console.error("Login error:", error);
      socket.emit("loginError", { message: "Login failed" });
    }
  });

  socket.on("log_out", async ({ userID }) => {
    try {
      console.log("<====Получено событие log_out, userID:====>", userID);
      // Находим пользователя по userID
      const onlineUser = await prisma.onlineUser.findFirst({
        where: { userId: Number(userID) },
      });

      // Если пользователь найден, удаляем его
      if (onlineUser) {
        await prisma.onlineUser.delete({
          where: { userId: onlineUser.userId },
        });
        console.log(`=======User ${onlineUser.userId} logged out=====`);
      } else {
        console.warn(`Пользователь с userID ${userID} не найден в OnlineUser`);
      }

      // Получаем обновлённый список онлайн-пользователей
      const onlineUsers = await prisma.onlineUser.findMany({
        select: { userId: true },
      });

      // Отправляем обновление всем клиентам
      io.emit("onlineUsersUpdate", {
        onlineUsers: onlineUsers.map((u) => u.userId.toString()),
      });
    } catch (error) {
      console.error("Error handling logout:", error);
    }
  });
};
