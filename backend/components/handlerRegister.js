export default (socket, prisma, bcrypt, saltRounds) => {
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
};
