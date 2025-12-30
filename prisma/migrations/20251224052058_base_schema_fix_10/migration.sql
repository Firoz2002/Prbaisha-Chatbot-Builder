/*
  Warnings:

  - You are about to drop the column `instructions` on the `chatbot` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `chatbot` DROP COLUMN `instructions`,
    ADD COLUMN `directive` VARCHAR(191) NOT NULL DEFAULT 'You are a helpful chatbot.';
