export default (socket, prisma) => {
  socket.on("get_users_liked_disliked", async () => {
    console.log("Received request to get users_liked_disliked");
    try {
      const users = await prisma.userMessageReaction.findMany({ take: 1000 });
      socket.emit("users_liked_disliked", users);
    } catch (error) {}
  });
};
