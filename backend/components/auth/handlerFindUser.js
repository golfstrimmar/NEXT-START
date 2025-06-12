export default (socket, prisma) => {
  socket.on("find_user", async ({ id }) => {
    const userID = Number(id);
    try {
      const user = await prisma.user.findUnique({
        where: { id: userID },
      });
      if (!user) {
        socket.emit("UserFailed", {
          message: "User not found",
        });
        return;
      }

      socket.emit("UserSuccess", {
        id: user.id,
        userName: user.userName,
        email: user.email,
      });
    } catch (error) {
      console.error("Login error:", error);
      socket.emit("UserFailed", { message: "User not found" });
    }
  });
};
