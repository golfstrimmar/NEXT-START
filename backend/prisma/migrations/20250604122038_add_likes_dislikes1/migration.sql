/*
  Warnings:

  - Added the required column `userName` to the `UserMessageReaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserMessageReaction" ADD COLUMN     "userName" TEXT NOT NULL;
