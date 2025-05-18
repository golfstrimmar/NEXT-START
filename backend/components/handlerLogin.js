export default (socket, prisma, jwt, bcrypt ) => {
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
};
