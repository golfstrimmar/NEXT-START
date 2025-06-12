export default (socket, prisma, io) => {
  socket.on("create_private_chat", async ({ senderId, receiverId }) => {
    try {
      console.log("<====Server on create private chat====>", {
        senderId,
        receiverId,
      });

      // Валидация входных данных
      if (!senderId || !receiverId) {
        socket.emit("createPrivateChatError", {
          message: "Invalid input",
          error: "senderId and receiverId are required",
        });
        return;
      }

      // Проверка, что отправитель и получатель разные
      if (senderId === receiverId) {
        socket.emit("createPrivateChatError", {
          message: "Cannot create chat with yourself",
          error: "Invalid receiverId",
        });
        return;
      }

      // Поиск существующего чата
      let chat = await prisma.privateChat.findFirst({
        where: {
          OR: [
            {
              participant1Id: Math.min(senderId, receiverId),
              participant2Id: Math.max(senderId, receiverId),
            },
            {
              participant1Id: Math.min(receiverId, senderId),
              participant2Id: Math.max(receiverId, senderId),
            },
          ],
        },
        include: {
          participant1: {
            select: { id: true, userName: true, avatarUrl: true },
          },
          participant2: {
            select: { id: true, userName: true, avatarUrl: true },
          },
        },
      });

      // Если чат существует
      if (chat) {
        const formattedChat = {
          id: chat.id,
          otherParticipant:
            chat.participant1Id === senderId
              ? chat.participant2
              : chat.participant1,
        };
        socket.emit("createPrivateChatSuccess", {
          message: "Private chat already exists",
          chat: formattedChat,
        });
        return;
      }

      // Создаём новый чат
      chat = await prisma.privateChat.create({
        data: {
          participant1Id: Math.min(senderId, receiverId),
          participant2Id: Math.max(senderId, receiverId),
        },
        include: {
          participant1: {
            select: { id: true, userName: true, avatarUrl: true },
          },
          participant2: {
            select: { id: true, userName: true, avatarUrl: true },
          },
        },
      });
      console.log("<====New private chat====>", chat);

      // Форматируем чат для отправителя
      const formattedChatForSender = {
        id: chat.id,
        otherParticipant:
          chat.participant1Id === senderId
            ? chat.participant2
            : chat.participant1,
      };

      // Форматируем чат для получателя
      const formattedChatForReceiver = {
        id: chat.id,
        otherParticipant:
          chat.participant1Id === receiverId
            ? chat.participant2
            : chat.participant1,
      };

      // Отправка создателю
      socket.emit("createPrivateChatSuccess", {
        message: "Private chat created",
        chat: formattedChatForSender,
      });

      // Отправка получателю
      console.log("<====Уведомление получателя====>", receiverId);
      io.to(`user_${receiverId}`).emit("newPrivateChat", {
        message: "New private chat created",
        chat: formattedChatForReceiver,
      });
    } catch (error) {
      socket.emit("createPrivateChatError", {
        message: "Failed to create private chat",
        error: error.message || "Unknown error",
      });
    }
  });
};
