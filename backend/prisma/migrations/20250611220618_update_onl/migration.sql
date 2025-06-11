/*
  Warnings:

  - The primary key for the `OnlineUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[socketId]` on the table `OnlineUser` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `userId` on the `OnlineUser` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "OnlineUser" DROP CONSTRAINT "OnlineUser_pkey",
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
ALTER COLUMN "lastActive" SET DEFAULT CURRENT_TIMESTAMP,
ADD CONSTRAINT "OnlineUser_pkey" PRIMARY KEY ("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OnlineUser_socketId_key" ON "OnlineUser"("socketId");

-- AddForeignKey
ALTER TABLE "OnlineUser" ADD CONSTRAINT "OnlineUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
