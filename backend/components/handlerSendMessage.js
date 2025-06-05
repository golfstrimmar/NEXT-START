export default (io, socket, prisma) => {
  socket.on("send_message", async (data) => {
    try {
      console.log("Received message:", data);
      const message = await prisma.message.create({
        data: {
          text: data.text,
          author: data.author || "Anonymous",
          authorID: data.authorID,
          createdAt: data.createdAt || new Date().toISOString(),
        },
      });
      console.log("Message saved:", message);
      io.emit("new_message", message);
    } catch (error) {
      console.error("Error saving message:", error);
      socket.emit("error", "Failed to save message");
    }
  });
};
