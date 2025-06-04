-- CreateTable
CREATE TABLE "UserMessageReaction" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "messageId" INTEGER NOT NULL,
    "reaction" TEXT NOT NULL,

    CONSTRAINT "UserMessageReaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserMessageReaction_userId_messageId_key" ON "UserMessageReaction"("userId", "messageId");

-- AddForeignKey
ALTER TABLE "UserMessageReaction" ADD CONSTRAINT "UserMessageReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMessageReaction" ADD CONSTRAINT "UserMessageReaction_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
