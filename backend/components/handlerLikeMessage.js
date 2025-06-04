export default (socket, prisma, io) => {
  socket.on("like_message", async ({ messageId, userId, userName }) => {
    console.log("<====messageId====>", messageId, "<====userId====>", userId);
    try {
      // Валидация
      if (isNaN(Number(messageId))) throw new Error("Invalid message ID");
      if (!userId) throw new Error("User ID is required");

      // Проверка существования сообщения
      const messageExists = await prisma.message.findUnique({
        where: { id: Number(messageId) },
      });
      if (!messageExists) throw new Error("Message not found");

      // Проверка, ставил ли пользователь лайк
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

      // Обновление реакции
      if (existingReaction && existingReaction.reaction === "dislike") {
        await prisma.userMessageReaction.delete({
          where: {
            userId_messageId: {
              userId: Number(userId),
              messageId: Number(messageId),
            },
          },
        });
        await prisma.message.update({
          where: { id: Number(messageId) },
          data: { dislikes: { decrement: 1 } },
        });
      }

      const message = await prisma.message.update({
        where: { id: Number(messageId) },
        data: { likes: { increment: 1 } },
      });

      await prisma.userMessageReaction.create({
        data: {
          userId: Number(userId),
          userName: userName,
          messageId: Number(messageId),
          reaction: "like",
        },
      });

      console.log("Message liked:", message, "by User ID:", userId);
      io.emit("message_liked", message, userId, userName);
    } catch (error) {
      console.error("Error liking message:", error);
      socket.emit("error", {
        message: error.message || "Failed to like message",
      });
    }
  });

  socket.on("dislike_message", async ({ messageId, userId, userName }) => {
    try {
      // Валидация
      if (isNaN(Number(messageId))) throw new Error("Invalid message ID");
      if (!userId) throw new Error("User ID is required");

      // Проверка существования сообщения
      const messageExists = await prisma.message.findUnique({
        where: { id: Number(messageId) },
      });
      if (!messageExists) throw new Error("Message not found");

      // Проверка, ставил ли пользователь дизлайк
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

      // Обновление реакции
      if (existingReaction && existingReaction.reaction === "like") {
        await prisma.userMessageReaction.delete({
          where: {
            userId_messageId: {
              userId: Number(userId),
              messageId: Number(messageId),
            },
          },
        });
        await prisma.message.update({
          where: { id: Number(messageId) },
          data: { likes: { decrement: 1 } },
        });
      }

      const message = await prisma.message.update({
        where: { id: Number(messageId) },
        data: { dislikes: { increment: 1 } },
      });

      await prisma.userMessageReaction.create({
        data: {
          userId: Number(userId),
          userName: userName,
          messageId: Number(messageId),
          reaction: "dislike",
        },
      });

      console.log("Message disliked:", message);
      io.emit("message_disliked", message, userId, userName);
    } catch (error) {
      console.error("Error disliking message:", error);
      socket.emit("error", {
        message: error.message || "Failed to dislike message",
      });
    }
  });
};
