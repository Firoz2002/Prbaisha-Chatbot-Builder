/*
  Warnings:

  - You are about to drop the column `image_url` on the `chatbot` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `chatbot` DROP COLUMN `image_url`,
    ADD COLUMN `avatar` VARCHAR(191) NULL,
    ADD COLUMN `border` ENUM('FLAT', 'ROUND', 'ROUNDED_FLAT') NOT NULL DEFAULT 'FLAT',
    ADD COLUMN `color` VARCHAR(191) NULL,
    ADD COLUMN `icon` VARCHAR(191) NULL,
    ADD COLUMN `popup_onload` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `shape` ENUM('ROUND', 'SQUARE', 'ROUNDED_SQUARE') NOT NULL DEFAULT 'ROUND',
    ADD COLUMN `size` INTEGER NULL,
    ADD COLUMN `theme` VARCHAR(191) NULL;
