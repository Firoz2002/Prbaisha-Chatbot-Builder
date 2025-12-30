/*
  Warnings:

  - You are about to drop the column `chatbotId` on the `message` table. All the data in the column will be lost.
  - Added the required column `conversationId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `message` DROP FOREIGN KEY `Message_chatbotId_fkey`;

-- DropIndex
DROP INDEX `Message_chatbotId_fkey` ON `message`;

-- AlterTable
ALTER TABLE `message` DROP COLUMN `chatbotId`,
    ADD COLUMN `conversationId` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `Conversation` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `chatbotId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `endedAt` DATETIME(3) NULL,

    INDEX `Conversation_chatbotId_idx`(`chatbotId`),
    INDEX `Conversation_userId_idx`(`userId`),
    INDEX `Conversation_isActive_idx`(`isActive`),
    INDEX `Conversation_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Message_conversationId_idx` ON `Message`(`conversationId`);

-- CreateIndex
CREATE INDEX `Message_createdAt_idx` ON `Message`(`createdAt`);

-- CreateIndex
CREATE INDEX `Message_senderType_idx` ON `Message`(`senderType`);

-- AddForeignKey
ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_chatbotId_fkey` FOREIGN KEY (`chatbotId`) REFERENCES `Chatbot`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `Conversation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `chatbot` RENAME INDEX `Chatbot_workspaceId_fkey` TO `Chatbot_workspaceId_idx`;
