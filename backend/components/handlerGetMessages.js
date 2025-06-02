export default (socket, prisma) => {
  socket.on("get_messages", async () => {
    try {
      const messages = await prisma.message.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
      });
      console.log("Send to client by Socket.io:", messages.length);
      socket.emit("messages", messages);
    } catch (error) {
      console.error("Error getting messages:", error);
      socket.emit("error", "Failed to get messages");
    }
  });
};
