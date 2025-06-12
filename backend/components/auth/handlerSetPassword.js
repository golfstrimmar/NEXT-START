export default (socket, prisma, bcrypt, saltRounds) => {
  socket.on(
    "setPassword",
    async ({ email, password, userName, googleId, avatarUrl }) => {
      try {
        const existingUser = await prisma.user.findFirst({
          where: { OR: [{ email }, { googleId }, { userName: userName }] },
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
            userName: userName,
            email,
            password: hashedPassword,
            googleId,
            avatarUrl,
          },
        });

        // Подготовка полного объекта пользователя
        const fullUser = {
          id: user.id,
          userName: user.userName,
          email: user.email,
          avatar: user.avatarUrl || null,
          createdAt: user.createdAt.toISOString(),
        };

        // Отправляем успешное событие для текущего клиента
        socket.emit("googleRegisterSuccess", {
          message: "Google registration successful",
          user: fullUser,
        });

        // Отправляем событие new_user для всех остальных клиентов
        socket.broadcast.emit("new_user", fullUser);
      } catch (error) {
        console.error("Set password error:", error);
        socket.emit("registrationError", { message: "Failed to set password" });
      }
    }
  );
};
