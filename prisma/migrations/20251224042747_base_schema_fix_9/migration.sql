/*
  Warnings:

  - You are about to drop the column `ownerId` on the `workspace` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `workspace` DROP FOREIGN KEY `Workspace_ownerId_fkey`;

-- DropIndex
DROP INDEX `Workspace_ownerId_fkey` ON `workspace`;

-- AlterTable
ALTER TABLE `workspace` DROP COLUMN `ownerId`;
