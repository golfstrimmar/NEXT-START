export default (socket, prisma, bcrypt, saltRounds) => {
  socket.on("register", async ({ userName, email, password }) => {
    try {
      // Проверка существования пользователя
      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { userName }] },
      });
      if (existingUser) {
        socket.emit("registrationError", {
          message:
            existingUser.email === email
              ? "Email already registered"
              : "userName already taken",
        });
        return;
      }

      // Хеширование пароля
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Создание пользователя
      const user = await prisma.user.create({
        data: {
          userName,
          email,
          password: hashedPassword,
        },
      });

      // Отправляем успешное событие для текущего клиента
      socket.emit("registrationSuccess", {
        message: "Registration successful",
        user: {
          id: user.id,
          userName: user.userName, // Приводим к формату authSlice
          email: user.email,
          avatar: user.avatar || null,
          createdAt: user.createdAt.toISOString(),
        },
      });

      // Отправляем событие new_user для всех клиентов
      socket.broadcast.emit("new_user", {
        id: user.id,
        userName: user.userName,
        email: user.email,
        avatar: user.avatar || null,
        createdAt: user.createdAt.toISOString(),
      });
    } catch (error) {
      console.error("Registration error:", error);
      socket.emit("registrationError", { message: "Registration failed" });
    }
  });
};
