export default (socket, prisma) => {
  socket.on("get_messages", async (data = {}) => {
    const page = Number(data.page) || 1;
    const limit = Number(data.limit) || 5;
    const sortOrder = data.sortOrder === "asc" ? "asc" : "desc";
    try {
      const skip = (page - 1) * limit;
      const [messages, totalMessages] = await Promise.all([
        prisma.message.findMany({
          orderBy: { createdAt: sortOrder },
          skip,
          take: limit,
        }),
        prisma.message.count(),
      ]);

      const totalPages = Math.ceil(totalMessages / limit);
      console.log(
        `Send to client by Socket.io: ${messages.length} messages, page ${page}, sortOrder ${sortOrder}, total pages: ${totalPages}`
      );

      socket.emit("messages", {
        messages,
        page,
        limit,
        sortOrder,
        totalPages,
        totalMessages,
      });
    } catch (error) {
      console.error("Error getting messages:", error);
      socket.emit("error", "Failed to get messages");
    }
  });
};
