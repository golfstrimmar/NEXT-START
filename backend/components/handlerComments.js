export default (socket, prisma, io) => {
  socket.on("get_comments", async () => {
    try {
      const comments = await prisma.comment.findMany();
      console.log("Comments sent to client:", comments.length);
      socket.emit("comments", comments);
    } catch (error) {
      console.error("Error getting comments:", error);
      socket.emit("error", "Failed to get comments");
    }
  });

  socket.on(
    "create_comment",
    async ({ messageId, userId, text, createdAt }) => {
      try {
        if (isNaN(Number(messageId))) throw new Error("Invalid message ID");
        if (!userId) throw new Error("User ID is required");
        if (!text || text.trim() === "")
          throw new Error("Comment text is required");

        const user = await prisma.user.findUnique({
          where: { id: Number(userId) },
          select: { userName: true },
        });
        if (!user) throw new Error("User not found");

        const messageExists = await prisma.message.findUnique({
          where: { id: Number(messageId) },
        });
        if (!messageExists) throw new Error("Message not found");

        const comment = await prisma.comment.create({
          data: {
            text: text.trim(),
            userId: Number(userId),
            userName: user.userName,
            messageId: Number(messageId),
            createdAt: createdAt || new Date().toISOString(),
          },
        });

        console.log("Comment created:", comment);
        io.emit("comment_created", comment);
      } catch (error) {
        console.error("Error creating comment:", error);
        socket.emit("error", {
          message: error.message || "Failed to create comment",
        });
      }
    }
  );

  socket.on("update_comment", async ({ commentId, userId, text }) => {
    try {
      if (isNaN(Number(commentId))) throw new Error("Invalid comment ID");
      if (!userId) throw new Error("User ID is required");
      if (!text || text.trim() === "")
        throw new Error("Comment text is required");

      const comment = await prisma.comment.findUnique({
        where: { id: Number(commentId) },
      });
      if (!comment) throw new Error("Comment not found");
      if (comment.userId !== Number(userId))
        throw new Error("Unauthorized to edit this comment");

      const updatedComment = await prisma.comment.update({
        where: { id: Number(commentId) },
        data: { text: text.trim() },
      });

      console.log("Comment updated:", updatedComment);
      io.emit("comment_updated", updatedComment);
    } catch (error) {
      console.error("Error updating comment:", error);
      socket.emit("error", {
        message: error.message || "Failed to update comment",
      });
    }
  });

  socket.on("delete_comment", async ({ commentId, userId }) => {
    try {
      if (isNaN(Number(commentId))) throw new Error("Invalid comment ID");
      if (!userId) throw new Error("User ID is required");

      const comment = await prisma.comment.findUnique({
        where: { id: Number(commentId) },
      });
      if (!comment) throw new Error("Comment not found");
      if (comment.userId !== Number(userId))
        throw new Error("Unauthorized to delete this comment");

      await prisma.comment.delete({
        where: { id: Number(commentId) },
      });

      console.log("Comment deleted:", commentId);
      io.emit("comment_deleted", {
        commentId: Number(commentId),
        messageId: comment.messageId,
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      socket.emit("error", {
        message: error.message || "Failed to delete comment",
      });
    }
  });

  socket.on("like_comment", async ({ commentId, userId }) => {
    console.log("<====Comment like====>", { commentId, userId });
    try {
      if (isNaN(Number(commentId))) throw new Error("Invalid comment ID");
      if (!userId) throw new Error("User ID is required");

      const user = await prisma.user.findUnique({
        where: { id: Number(userId) },
        select: { userName: true },
      });
      if (!user) throw new Error("User not found");

      const comment = await prisma.comment.findUnique({
        where: { id: Number(commentId) },
        include: { commentReactions: true },
      });
      if (!comment) throw new Error("Comment not found");

      const existingReaction = await prisma.commentReaction.findFirst({
        where: { commentId: Number(commentId), userId: Number(userId) },
      });

      let updatedComment;
      await prisma.$transaction(async (tx) => {
        if (existingReaction) {
          if (existingReaction.reaction === "like") {
            throw new Error("You already liked this comment");
          } else if (existingReaction.reaction === "dislike") {
            await tx.commentReaction.update({
              where: { id: existingReaction.id },
              data: { reaction: "like" },
            });
            updatedComment = await tx.comment.update({
              where: { id: Number(commentId) },
              data: {
                likes: { increment: 1 },
                dislikes: { set: Math.max(0, comment.dislikes - 1) },
              },
            });
          }
        } else {
          await tx.commentReaction.create({
            data: {
              userId: Number(userId),
              userName: user.userName,
              commentId: Number(commentId),
              messageId: comment.messageId,
              reaction: "like",
            },
          });
          updatedComment = await tx.comment.update({
            where: { id: Number(commentId) },
            data: { likes: { increment: 1 } },
          });
        }
      });

      console.log("Comment liked:", updatedComment);
      io.emit("comment_updated", updatedComment);
    } catch (error) {
      console.error("Error liking comment:", {
        error: error.message,
        commentId,
        userId,
      });
      socket.emit("error", {
        message: error.message || "Failed to like comment",
      });
    }
  });

  socket.on("dislike_comment", async ({ commentId, userId }) => {
    console.log("<====Comment dislike====>", { commentId, userId });
    try {
      if (isNaN(Number(commentId))) throw new Error("Invalid comment ID");
      if (!userId) throw new Error("User ID is required");

      const user = await prisma.user.findUnique({
        where: { id: Number(userId) },
        select: { userName: true },
      });
      if (!user) throw new Error("User not found");

      const comment = await prisma.comment.findUnique({
        where: { id: Number(commentId) },
        include: { commentReactions: true },
      });
      if (!comment) throw new Error("Comment not found");

      const existingReaction = await prisma.commentReaction.findFirst({
        where: { commentId: Number(commentId), userId: Number(userId) },
      });

      let updatedComment;
      await prisma.$transaction(async (tx) => {
        if (existingReaction) {
          if (existingReaction.reaction === "dislike") {
            throw new Error("You already disliked this comment");
          } else if (existingReaction.reaction === "like") {
            await tx.commentReaction.update({
              where: { id: existingReaction.id },
              data: { reaction: "dislike" },
            });
            updatedComment = await tx.comment.update({
              where: { id: Number(commentId) },
              data: {
                likes: { set: Math.max(0, comment.likes - 1) },
                dislikes: { increment: 1 },
              },
            });
          }
        } else {
          await tx.commentReaction.create({
            data: {
              userId: Number(userId),
              userName: user.userName,
              commentId: Number(commentId),
              messageId: comment.messageId, // Добавлено обязательное поле
              reaction: "dislike",
            },
          });
          updatedComment = await tx.comment.update({
            where: { id: Number(commentId) },
            data: { dislikes: { increment: 1 } },
          });
        }
      });

      console.log("Comment disliked:", updatedComment);
      io.emit("comment_updated", updatedComment);
    } catch (error) {
      console.error("Error disliking comment:", {
        error: error.message,
        commentId,
        userId,
      });
      socket.emit("error", {
        message: error.message || "Failed to dislike comment",
      });
    }
  });
};
