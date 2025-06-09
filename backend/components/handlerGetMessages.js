export default (socket, prisma) => {
  socket.on("get_messages", async (data = {}) => {
    console.log("Received request to get messages:", data);

    const page = Number(data.page) || 1;
    const limit = Number(data.limit) || 5;
    const sortOrder = data.sortOrder === "asc" ? "asc" : "desc";
    const authorId = data.authorId ? Number(data.authorId) : null;
    const search = data.search ? String(data.search).trim() : null;

    try {
      const skip = (page - 1) * limit;
      const where = {};

      if (authorId) {
        where.authorID = authorId;
      }

      if (search) {
        where.text = {
          contains: search,
          mode: "insensitive",
        };
      }

      const [messages, totalMessages] = await Promise.all([
        prisma.message.findMany({
          where,
          orderBy: { createdAt: sortOrder },
          skip,
          take: limit,
        }),
        prisma.message.count({ where }),
      ]);

      const totalPages = Math.ceil(totalMessages / limit);
      console.log(
        `Sent to client by Socket.io: ${
          messages.length
        } messages, page ${page}, sortOrder ${sortOrder}, authorId ${
          authorId || "all"
        }, search "${search || "none"}", total pages: ${totalPages}`
      );

      socket.emit("messages", {
        messages,
        page,
        limit,
        sortOrder,
        authorId,
        search,
        totalPages,
        totalMessages,
      });
    } catch (error) {
      console.error("Error getting messages:", error);
      socket.emit("error", { message: "Failed to get messages", error });
    }
  });
};
