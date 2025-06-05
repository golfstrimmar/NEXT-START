export default (socket, prisma, io) => {
  socket.on("delete_message", async ({ id }) => {
    try {
      const deletedMessage = await prisma.message.delete({
        where: { id: Number(id) },
      });
      console.log("Deleted Message ---", deletedMessage);
      io.emit("message_deleted", deletedMessage);
    } catch (error) {
      console.error("Error delete message:", error);
      socket.emit("error", "Failed to delete message");
    }
  });
};
