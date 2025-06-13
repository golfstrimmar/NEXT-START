export default (socket, prisma, jwt, bcrypt, io) => {
  socket.on("log_out", async ({ userID }) => {
    try {
      console.log("<====Получено событие log_out, userID:====>", userID);
      // Находим пользователя по userID
      const onlineUser = await prisma.onlineUser.findFirst({
        where: { userId: Number(userID) },
      });

      // Если пользователь найден, удаляем его
      if (onlineUser) {
        await prisma.onlineUser.delete({
          where: { userId: onlineUser.userId },
        });
        console.log(`=======User ${onlineUser.userId} logged out=====`);
      } else {
        console.warn(`Пользователь с userID ${userID} не найден в OnlineUser`);
      }

      // Получаем обновлённый список онлайн-пользователей
      const onlineUsers = await prisma.onlineUser.findMany({
        select: { userId: true },
      });

      // Отправляем обновление всем клиентам
      io.emit("onlineUsersUpdate", {
        onlineUsers: onlineUsers.map((u) => u.userId.toString()),
      });
    } catch (error) {
      console.error("Error handling logout:", error);
    }
  });
};
