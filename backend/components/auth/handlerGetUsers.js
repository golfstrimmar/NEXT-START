export default (socket, prisma, io) => {
  socket.on("get_users", async () => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          userName: true,
          email: true,
          avatarUrl: true,
          createdAt: true,
        },
      });

      const onlineUsers = await prisma.onlineUser.findMany({
        select: { userId: true },
      });
      io.emit("users", {
        users: users,
        onlineUsers: onlineUsers.map((u) => u.userId),
      });
    } catch (error) {
      console.error("Error getting users:", error);
      socket.emit("error", "Failed to get users");
    }
  });
};
