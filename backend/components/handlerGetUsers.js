export default (socket, prisma) => {
  socket.on("get_users", async () => {
    console.log("Received request to get users");
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
      console.log("Users sent to client:", users.length);
      socket.emit("users", users);
    } catch (error) {
      console.error("Error getting users:", error);
      socket.emit("error", "Failed to get users");
    }
  });
};
