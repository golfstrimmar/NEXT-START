export default (socket, prisma, io) => {
  socket.on("create_chat_message", async () => {
    try {
      console.log("<====Server on creat chat-message====>");
      // const messages = await prisma.message.findMany();
      // console.log("Messages sent to client:", messages.length);
      // socket.emit("messages", messages);
    } catch (error) {
      console.error("Error creating chat-messages:", error);
      socket.emit("error", "Failed to create chat-message");
    }
  });
};
