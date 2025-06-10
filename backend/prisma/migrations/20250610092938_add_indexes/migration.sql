-- CreateIndex
CREATE INDEX "Comment_userId_messageId_createdAt_idx" ON "Comment"("userId", "messageId", "createdAt");

-- CreateIndex
CREATE INDEX "CommentReaction_userId_commentId_idx" ON "CommentReaction"("userId", "commentId");

-- CreateIndex
CREATE INDEX "Message_authorID_createdAt_idx" ON "Message"("authorID", "createdAt");

-- CreateIndex
CREATE INDEX "User_email_userName_idx" ON "User"("email", "userName");

-- CreateIndex
CREATE INDEX "UserMessageReaction_userId_messageId_idx" ON "UserMessageReaction"("userId", "messageId");
