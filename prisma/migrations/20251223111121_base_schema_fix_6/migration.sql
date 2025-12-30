/*
  Warnings:

  - Added the required column `userId` to the `Chatbot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `chatbot` ADD COLUMN `userId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Chatbot` ADD CONSTRAINT `Chatbot_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
