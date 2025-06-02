export default (socket, prisma) => {
  socket.on("delete_message", async ({ id }) => {
    const deletedMessage = await prisma.message.delete({
      where: { id: Number(id) },
    });
    console.log("Deleted Message ---", deletedMessage);
    socket.emit("message_deleted", deletedMessage);
  });
};
