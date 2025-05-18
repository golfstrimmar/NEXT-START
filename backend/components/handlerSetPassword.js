export default (socket, prisma, bcrypt, saltRounds) => {
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
};
