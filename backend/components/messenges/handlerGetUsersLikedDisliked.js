export default (socket, prisma) => {
  socket.on("get_users_liked_disliked", async () => {
    try {
      const users = await prisma.userMessageReaction.findMany({ take: 1000 });
      socket.emit("users_liked_disliked", users);
    } catch (error) {}
  });
};
