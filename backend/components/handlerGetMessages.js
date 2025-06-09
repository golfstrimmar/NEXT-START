export default (socket, prisma) => {
  socket.on("get_messages", async (data = {}) => {
    const page = Number(data.page) || 1;
    const limit = Number(data.limit) || 5;

    try {
      const skip = (page - 1) * limit;
      const [messages, totalMessages] = await Promise.all([
        prisma.message.findMany({
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.message.count(),
      ]);

      const totalPages = Math.ceil(totalMessages / limit);
      console.log(
        `Send to client by Socket.io: ${messages.length} messages, page ${page}, total pages: ${totalPages}`
      );

      socket.emit("messages", {
        messages,
        page,
        limit,
        totalPages,
        totalMessages,
      });
    } catch (error) {
      console.error("Error getting messages:", error);
      socket.emit("error", "Failed to get messages");
    }
  });
};
