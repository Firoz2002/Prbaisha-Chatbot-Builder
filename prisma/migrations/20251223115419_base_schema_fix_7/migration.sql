/*
  Warnings:

  - You are about to drop the column `userId` on the `chatbot` table. All the data in the column will be lost.
  - Added the required column `workspaceId` to the `Chatbot` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `chatbot` DROP FOREIGN KEY `Chatbot_userId_fkey`;

-- DropIndex
DROP INDEX `Chatbot_userId_fkey` ON `chatbot`;

-- AlterTable
ALTER TABLE `chatbot` DROP COLUMN `userId`,
    ADD COLUMN `workspaceId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Chatbot` ADD CONSTRAINT `Chatbot_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
