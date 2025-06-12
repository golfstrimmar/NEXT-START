export default (socket, prisma, io) => {
  socket.on("get_private_chats", async ({ senderId }) => {
    try {
      console.log("<====Server on get private chats====>", senderId);
      if (!senderId) {
        socket.emit("getPrivateChatsError", {
          message: "Invalid input",
          error: "senderId is required",
        });
        return;
      }
      const chats = await prisma.privateChat.findMany({
        where: {
          OR: [{ participant1Id: senderId }, { participant2Id: senderId }],
        },
        include: {
          participant1: {
            select: { id: true, userName: true, avatarUrl: true },
          },
          participant2: {
            select: { id: true, userName: true, avatarUrl: true },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { id: true, text: true, createdAt: true, senderId: true },
          },
        },
      });
      const formattedChats = chats.map((chat) => ({
        id: chat.id,
        otherParticipant:
          chat.participant1Id === senderId
            ? chat.participant2
            : chat.participant1,
      }));
      socket.emit("getPrivateChatsSuccess", {
        message: "Private chats retrieved",
        chats: formattedChats,
      });
      // console.log("<====Private chats sent====>", chats.length);
    } catch (error) {
      // console.error("Error getting private chats:", error.message);
      socket.emit("getPrivateChatsError", {
        message: "Failed to retrieve private chats",
        error: error.message || "Unknown error",
      });
    }
  });
};
