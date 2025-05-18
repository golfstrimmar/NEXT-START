export default (socket, prisma, googleClient, jwt) => {
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
};
