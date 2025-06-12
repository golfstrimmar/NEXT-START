export default (socket, prisma, io) => {
  socket.on("like_message", async ({ messageId, userId, userName }) => {
    try {
      if (isNaN(Number(messageId))) throw new Error("Invalid message ID");
      if (!userId) throw new Error("User ID is required");

      const messageExists = await prisma.message.findUnique({
        where: { id: Number(messageId) },
      });
      if (!messageExists) throw new Error("Message not found");

      const existingReaction = await prisma.userMessageReaction.findUnique({
        where: {
          userId_messageId: {
            userId: Number(userId),
            messageId: Number(messageId),
          },
        },
      });
      if (existingReaction && existingReaction.reaction === "like") {
        throw new Error("User already liked this message");
      }
      if (existingReaction && existingReaction.reaction === "dislike") {
        await prisma.userMessageReaction.delete({
          where: {
            userId_messageId: {
              userId: Number(userId),
              messageId: Number(messageId),
            },
          },
        });
      }
      await prisma.userMessageReaction.create({
        data: {
          userId: Number(userId),
          userName: userName,
          messageId: Number(messageId),
          reaction: "like",
        },
      });
      try {
        const users = await prisma.userMessageReaction.findMany({ take: 1000 });
        io.emit("users_liked_disliked", users);
      } catch (error) {
        console.error("Error getting users_liked_disliked:", error);
      }
    } catch (error) {
      console.error("Error liking message:", error);
      socket.emit("error", {
        message: error.message || "Failed to like message",
      });
    }
  });

  socket.on("dislike_message", async ({ messageId, userId, userName }) => {
    try {
      if (isNaN(Number(messageId))) throw new Error("Invalid message ID");
      if (!userId) throw new Error("User ID is required");

      const messageExists = await prisma.message.findUnique({
        where: { id: Number(messageId) },
      });
      if (!messageExists) throw new Error("Message not found");

      const existingReaction = await prisma.userMessageReaction.findUnique({
        where: {
          userId_messageId: {
            userId: Number(userId),
            messageId: Number(messageId),
          },
        },
      });
      if (existingReaction && existingReaction.reaction === "dislike") {
        throw new Error("User already disliked this message");
      }

      if (existingReaction && existingReaction.reaction === "like") {
        await prisma.userMessageReaction.delete({
          where: {
            userId_messageId: {
              userId: Number(userId),
              messageId: Number(messageId),
            },
          },
        });
      }
      await prisma.userMessageReaction.create({
        data: {
          userId: Number(userId),
          userName: userName,
          messageId: Number(messageId),
          reaction: "dislike",
        },
      });
      try {
        const users = await prisma.userMessageReaction.findMany({ take: 1000 });
        io.emit("users_liked_disliked", users);
      } catch (error) {
        console.error("Error getting users_liked_disliked:", error);
      }
    } catch (error) {
      console.error("Error disliking message:", error);
      socket.emit("error", {
        message: error.message || "Failed to dislike message",
      });
    }
  });
};
