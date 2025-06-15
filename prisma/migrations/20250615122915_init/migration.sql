-- CreateEnum
CREATE TYPE "enum_Chapter_status" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "enum_User_role" AS ENUM ('user', 'admin');

-- CreateTable
CREATE TABLE "Chapter" (
    "chapterId" UUID NOT NULL,
    "malId" INTEGER NOT NULL,
    "language" VARCHAR(255) NOT NULL,
    "volume" INTEGER,
    "chapterNumber" INTEGER,
    "chapterTitle" VARCHAR(255),
    "isOneshot" BOOLEAN NOT NULL DEFAULT false,
    "status" "enum_Chapter_status" NOT NULL DEFAULT 'pending',
    "rejectionReason" TEXT,
    "uploaderId" UUID NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("chapterId")
);

-- CreateTable
CREATE TABLE "Page" (
    "pageId" SERIAL NOT NULL,
    "chapterId" UUID NOT NULL,
    "filePath" VARCHAR(255) NOT NULL,
    "fileOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("pageId")
);

-- CreateTable
CREATE TABLE "User" (
    "userId" UUID NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "enum_User_role" NOT NULL DEFAULT 'user',
    "bio" VARCHAR(500),
    "avatarUrl" VARCHAR(255),
    "resetPasswordToken" VARCHAR(255),
    "resetPasswordExpires" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("chapterId") ON DELETE CASCADE ON UPDATE CASCADE;
