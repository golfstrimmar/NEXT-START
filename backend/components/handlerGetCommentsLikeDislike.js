export default (socket, prisma) => {
  socket.on("get_commets_liked_disliked", async () => {
    console.log("Received request to get commets_liked_disliked");
    try {
      const reaction = await prisma.CommentReaction.findMany({ take: 1000 });
      socket.emit("commets_liked_disliked", reaction);
    } catch (error) {
      console.error("Error getting commets_liked_disliked:", error);
      socket.emit("error", "Failed to get commets_liked_disliked");
    }
  });
};
