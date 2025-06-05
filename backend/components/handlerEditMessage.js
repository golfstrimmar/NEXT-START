export default (io, socket, prisma) => {
  socket.on("edit_message", async (data) => {
    try {
      console.log("Received edit message request:", data);

      const existingMessage = await prisma.message.findUnique({
        where: { id: data.id },
      });

      if (!existingMessage) {
        console.error("Message not found:", data.id);
        socket.emit("error", "Message not found");
        return;
      }
      console.log("Existing message:", existingMessage);
      if (existingMessage.author !== data.author) {
        console.error("Unauthorized edit attempt by:", data.author);
        socket.emit("error", "You are not authorized to edit this message");
        return;
      }

      const updatedMessage = await prisma.message.update({
        where: { id: data.id },
        data: { text: data.text },
      });

      console.log("Message updated:", updatedMessage);
      io.emit("message_updated", updatedMessage);
    } catch (error) {
      console.error("Error updating message:", error);
      socket.emit("error", "Failed to update message");
    }
  });
};
