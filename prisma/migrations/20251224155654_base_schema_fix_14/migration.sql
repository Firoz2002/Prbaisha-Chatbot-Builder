/*
  Warnings:

  - You are about to drop the column `border` on the `chatbot` table. All the data in the column will be lost.
  - You are about to drop the column `color` on the `chatbot` table. All the data in the column will be lost.
  - You are about to drop the column `shape` on the `chatbot` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `chatbot` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `chatbot` DROP COLUMN `border`,
    DROP COLUMN `color`,
    DROP COLUMN `shape`,
    DROP COLUMN `size`,
    ADD COLUMN `avatarBgColor` VARCHAR(191) NULL,
    ADD COLUMN `avatarBorder` ENUM('FLAT', 'ROUND', 'ROUNDED_FLAT') NOT NULL DEFAULT 'FLAT',
    ADD COLUMN `avatarColor` VARCHAR(191) NULL,
    ADD COLUMN `avatarSize` INTEGER NULL,
    ADD COLUMN `iconBgColor` VARCHAR(191) NULL,
    ADD COLUMN `iconBorder` ENUM('FLAT', 'ROUND', 'ROUNDED_FLAT') NOT NULL DEFAULT 'FLAT',
    ADD COLUMN `iconColor` VARCHAR(191) NULL,
    ADD COLUMN `iconShape` ENUM('ROUND', 'SQUARE', 'ROUNDED_SQUARE') NOT NULL DEFAULT 'ROUND',
    ADD COLUMN `iconSize` INTEGER NULL;
