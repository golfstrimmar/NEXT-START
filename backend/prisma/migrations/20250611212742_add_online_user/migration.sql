-- CreateTable
CREATE TABLE "OnlineUser" (
    "userId" TEXT NOT NULL,
    "socketId" TEXT NOT NULL,
    "lastActive" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnlineUser_pkey" PRIMARY KEY ("userId")
);
