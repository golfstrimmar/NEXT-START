export default (socket, prisma, io) => {
  socket.on("create_private_chat", async ({ senderId, receiverId }) => {
    try {
      console.log("<====Server on create private chat====>", {
        senderId,
        receiverId,
      });

      // Валидация входных данных
      if (!senderId || !receiverId) {
        console.log("<====Invalid input====>", { senderId, receiverId });
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
      console.log("<====Chat found====>", chat);
      // Если чат существует, отправляем уведомление об этом
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

        console.log("<====Private chat already exists====>", { id: chat.id });
        return; // Прерываем выполнение, так как чат уже существует
      }

      // Если чат не существует, создаём новый
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
      // Форматирование данных чата для ответа
      const formattedChat = {
        id: chat.id,
        otherParticipant: chat.participant2,
      };

      // Отправка ответа отправителю
      socket.emit("createPrivateChatSuccess", {
        message: "Private chat created",
        chat: formattedChat,
      });

      // Уведомление получателя
      io.to(`user_${receiverId}`).emit("newPrivateChat", {
        message: "New private chat created",
        chat: {
          id: chat.id,
          otherParticipant:
            chat.participant1Id === receiverId
              ? chat.participant1
              : chat.participant2,
        },
      });

      console.log("<====Private chat created====>", { chat });
    } catch (error) {
      console.error("Error creating private chat:", error.message);
      socket.emit("createPrivateChatError", {
        message: "Failed to create private chat",
        error: error.message || "Unknown error",
      });
    }
  });

  socket.on("delete_private_chat", async ({ senderId, chatId }) => {
    try {
      console.log("<====Server on delete private chat====>", {
        senderId,
        chatId,
      });

      // Валидация входных данных
      if (!senderId || !chatId) {
        console.log("<====Invalid input====>", { senderId, chatId });
        socket.emit("deletePrivateChatError", {
          message: "Invalid input",
          error: "senderId and chatId are required",
        });
        return;
      }

      // Проверка существования чата и прав доступа
      const chat = await prisma.privateChat.findUnique({
        where: { id: chatId },
        select: {
          id: true,
          participant1Id: true,
          participant2Id: true,
          participant1: {
            select: { id: true, userName: true, avatarUrl: true },
          },
          participant2: {
            select: { id: true, userName: true, avatarUrl: true },
          },
        },
      });

      if (
        !chat ||
        (chat.participant1Id !== senderId && chat.participant2Id !== senderId)
      ) {
        console.log("<====Invalid chat or access denied====>", {
          chatId,
          senderId,
        });
        socket.emit("deletePrivateChatError", {
          message: "Invalid chat or access denied",
          error: "Chat not found or user is not a participant",
        });
        return;
      }

      // Удаление чата (сообщения удаляются каскадно благодаря onDelete: Cascade)
      await prisma.privateChat.delete({
        where: { id: chatId },
      });

      // Определение другого участника для уведомления
      const otherParticipantId =
        chat.participant1Id === senderId
          ? chat.participant2Id
          : chat.participant1Id;

      // Отправка ответа отправителю
      socket.emit("deletePrivateChatSuccess", {
        message: "Private chat deleted",
        chatId,
      });

      // Уведомление другого участника
      io.to(`user_${otherParticipantId}`).emit("privateChatDeleted", {
        message: "Private chat deleted",
        chatId,
      });

      console.log("<====Private chat deleted====>", { id: chatId });
    } catch (error) {
      console.error("Error deleting private chat:", error.message);
      socket.emit("deletePrivateChatError", {
        message: "Failed to delete private chat",
        error: error.message || "Unknown error",
      });
    }
  });

  // Событие join
  socket.on("join", ({ senderId }) => {
    socket.join(`user_${senderId}`);
    console.log(`<====User joined room====> user_${senderId}`);
  });

  // Получение списка чатов
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
        lastMessage: chat.messages[0]
          ? {
              id: chat.messages[0].id,
              text: chat.messages[0].text,
              createdAt: chat.messages[0].createdAt.toISOString(),
              senderId: chat.messages[0].senderId,
            }
          : null,
      }));
      socket.emit("getPrivateChatsSuccess", {
        message: "Private chats retrieved",
        chats: formattedChats,
      });
      console.log("<====Private chats sent====>", chats.length);
    } catch (error) {
      console.error("Error getting private chats:", error.message);
      socket.emit("getPrivateChatsError", {
        message: "Failed to retrieve private chats",
        error: error.message || "Unknown error",
      });
    }
  });

  // Получение сообщений в чате
  socket.on("get_private_messages", async ({ senderId, chatId }) => {
    console.log("<====Server on get private messages====>", {
      senderId,
      chatId,
    });
    try {
      if (!senderId || !chatId) {
        socket.emit("getPrivateMessagesError", {
          message: "Invalid input",
          error: "senderId and chatId are required",
        });
        return;
      }
      const chat = await prisma.privateChat.findUnique({
        where: { id: chatId },
        select: { participant1Id: true, participant2Id: true },
      });
      if (
        !chat ||
        (chat.participant1Id !== senderId && chat.participant2Id !== senderId)
      ) {
        socket.emit("getPrivateMessagesError", {
          message: "Access denied",
          error: "Invalid chatId",
        });
        return;
      }
      const messages = await prisma.privateMessage.findMany({
        where: { chatId },
        orderBy: { createdAt: "desc" },
        include: {
          sender: { select: { id: true, userName: true, avatarUrl: true } },
          receiver: { select: { id: true, userName: true, avatarUrl: true } },
        },
      });
      const formattedMessages = messages.map((msg) => ({
        id: msg.id,
        chatId: msg.chatId,
        sender: {
          id: msg.sender.id,
          userName: msg.sender.userName,
          avatar: msg.sender.avatarUrl || "",
        },
        receiver: {
          id: msg.receiver.id,
          userName: msg.receiver.userName,
          avatar: msg.receiver.avatarUrl || "",
        },
        text: msg.text,
        createdAt: msg.createdAt.toISOString(),
      }));
      socket.emit("getPrivateMessagesSuccess", {
        chatId: chatId,
        messages: formattedMessages,
      });
      console.log("<====Private messages sent====>", formattedMessages.length);
    } catch (error) {
      console.error("Error getting private messages:", error.message);
      socket.emit("getPrivateMessagesError", {
        message: "Failed to retrieve private messages",
        error: error.message || "Unknown error",
      });
    }
  });

  socket.on(
    "create_chat_message",
    async ({ senderId, receiverId, text, chatId }) => {
      try {
        console.log(
          "<====Server on create chat-message====>",
          senderId,
          receiverId,
          chatId,
          text
        );

        // Валидация входных данных
        if (
          !senderId ||
          !receiverId ||
          !text ||
          typeof text !== "string" ||
          text.trim().length === 0
        ) {
          console.log("<====Invalid input====>", {
            senderId,
            receiverId,
            text,
            chatId,
          });
          socket.emit("createChatMessageError", {
            message: "Invalid input",
            error: "SenderId, receiverId, and non-empty text are required",
          });
          return;
        }

        // Проверка, что отправитель и получатель разные
        if (senderId === receiverId) {
          socket.emit("createChatMessageError", {
            message: "Cannot send message to yourself",
            error: "Invalid receiverId",
          });
          return;
        }

        let chat;

        // Если chatId предоставлен, проверяем его
        if (chatId) {
          chat = await prisma.privateChat.findUnique({
            where: { id: chatId },
            include: {
              participant1: {
                select: { id: true, userName: true, avatarUrl: true },
              },
              participant2: {
                select: { id: true, userName: true, avatarUrl: true },
              },
            },
          });

          // Проверяем, что чат существует и пользователь является участником
          if (
            !chat ||
            (chat.participant1Id !== senderId &&
              chat.participant2Id !== senderId)
          ) {
            console.log("<====Invalid chat====>", chatId);
            socket.emit("createChatMessageError", {
              message: "Invalid chat",
              error: "Chat not found or user is not a participant",
            });
            return;
          }
        } else {
          // Если chatId не предоставлен, ищем или создаём чат
          chat = await prisma.privateChat.findFirst({
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

          if (!chat) {
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
          }
        }
        console.log("<====chat====>", chat);
        // Создание сообщения
        const message = await prisma.privateMessage.create({
          data: {
            chatId: chat.id,
            senderId,
            receiverId,
            text: text.trim(),
          },
          include: {
            sender: { select: { id: true, userName: true, avatarUrl: true } },
            receiver: { select: { id: true, userName: true, avatarUrl: true } },
          },
        });

        // Форматирование сообщения для ответа
        const formattedMessage = {
          id: message.id,
          chatId: message.chatId,
          sender: {
            id: message.sender.id,
            userName: message.sender.userName,
            avatar: message.sender.avatarUrl || "",
          },
          receiver: {
            id: message.receiver.id,
            userName: message.receiver.userName,
            avatar: message.receiver.avatarUrl || "",
          },
          text: message.text,
          createdAt: message.createdAt.toISOString(),
        };

        console.log("<====formatted Message to send====>", formattedMessage);
        // Отправка ответа отправителю
        socket.emit("createChatMessageSuccess", {
          message: "Message created",
          data: formattedMessage,
        });

        // Отправка уведомления получателю
        io.to(`user_${receiverId}`).emit("newChatMessage", {
          message: "New chat message received",
          data: formattedMessage,
        });

        console.log("<====Chat message created====>", {
          id: message.id,
          chatId: message.chatId,
        });
      } catch (error) {
        console.error("Error creating chat-message:", error);
        socket.emit("error", {
          message: "Failed to create chat-message",
          error: error.message || "Unknown error",
        });
      }
    }
  );
};
