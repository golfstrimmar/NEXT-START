export default (io, socket, googleClient, prisma) => {
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
};
