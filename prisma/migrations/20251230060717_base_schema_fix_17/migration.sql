/*
  Warnings:

  - The values [POPUP,MODAL] on the enum `LeadCollection_leadFormStyle` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `leadform` MODIFY `leadFormStyle` ENUM('EMBEDDED', 'MESSAGES') NOT NULL DEFAULT 'EMBEDDED';

-- CreateTable
CREATE TABLE `Logic` (
    `id` VARCHAR(191) NOT NULL,
    `chatbotId` VARCHAR(191) NOT NULL,
    `type` ENUM('COLLECT_LEADS', 'LINK_BUTTON', 'SCHEDULE_MEETING', 'ZAPIER_INTEGRATION', 'SUGGESTIONS', 'CUSTOM_ACTION') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `config` JSON NOT NULL,
    `triggerType` ENUM('KEYWORD', 'ALWAYS', 'MANUAL', 'END_OF_CONVERSATION', 'MESSAGE_COUNT', 'TIME_DELAY') NOT NULL DEFAULT 'KEYWORD',
    `keywords` TEXT NULL,
    `showAlways` BOOLEAN NOT NULL DEFAULT false,
    `showAtEnd` BOOLEAN NOT NULL DEFAULT false,
    `showOnButton` BOOLEAN NOT NULL DEFAULT false,
    `triggerConfig` JSON NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `position` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Logic_chatbotId_idx`(`chatbotId`),
    INDEX `Logic_type_idx`(`type`),
    INDEX `Logic_isActive_idx`(`isActive`),
    INDEX `Logic_position_idx`(`position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LinkButton` (
    `id` VARCHAR(191) NOT NULL,
    `logicId` VARCHAR(191) NOT NULL,
    `buttonText` VARCHAR(191) NOT NULL,
    `buttonIcon` VARCHAR(191) NULL,
    `buttonLink` VARCHAR(191) NOT NULL,
    `openInNewTab` BOOLEAN NOT NULL DEFAULT true,
    `buttonColor` VARCHAR(191) NULL DEFAULT '#3b82f6',
    `textColor` VARCHAR(191) NULL DEFAULT '#ffffff',
    `buttonSize` ENUM('SMALL', 'MEDIUM', 'LARGE') NOT NULL DEFAULT 'MEDIUM',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `LinkButton_logicId_key`(`logicId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MeetingSchedule` (
    `id` VARCHAR(191) NOT NULL,
    `logicId` VARCHAR(191) NOT NULL,
    `calendarType` ENUM('CALENDLY', 'GOOGLE_CALENDAR', 'OUTLOOK_CALENDAR', 'CUSTOM') NOT NULL DEFAULT 'CALENDLY',
    `calendarLink` VARCHAR(191) NOT NULL,
    `calendarId` VARCHAR(191) NULL,
    `duration` INTEGER NULL DEFAULT 30,
    `timezone` VARCHAR(191) NULL DEFAULT 'UTC',
    `titleFormat` VARCHAR(191) NULL DEFAULT 'Meeting with {company}',
    `description` TEXT NULL,
    `availabilityDays` TEXT NULL,
    `availabilityHours` TEXT NULL,
    `bufferTime` INTEGER NULL DEFAULT 5,
    `showTimezoneSelector` BOOLEAN NOT NULL DEFAULT true,
    `requireConfirmation` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MeetingSchedule_logicId_key`(`logicId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LeadCollection` (
    `id` VARCHAR(191) NOT NULL,
    `logicId` VARCHAR(191) NOT NULL,
    `formTitle` VARCHAR(191) NOT NULL DEFAULT 'Get Started',
    `formDesc` TEXT NULL,
    `leadTiming` ENUM('BEGINNING', 'MIDDLE', 'END') NOT NULL DEFAULT 'BEGINNING',
    `leadFormStyle` ENUM('EMBEDDED', 'MESSAGES') NOT NULL DEFAULT 'EMBEDDED',
    `cadence` ENUM('ALL_AT_ONCE', 'ONE_BY_ONE', 'GROUPED') NOT NULL DEFAULT 'ALL_AT_ONCE',
    `fields` TEXT NOT NULL,
    `fieldOrder` TEXT NULL,
    `successMessage` TEXT NULL,
    `redirectUrl` VARCHAR(191) NULL,
    `autoClose` BOOLEAN NOT NULL DEFAULT true,
    `showThankYou` BOOLEAN NOT NULL DEFAULT true,
    `notifyEmail` VARCHAR(191) NULL,
    `webhookUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `LeadCollection_logicId_key`(`logicId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FormField` (
    `id` VARCHAR(191) NOT NULL,
    `leadCollectionId` VARCHAR(191) NOT NULL,
    `type` ENUM('TEXT', 'EMAIL', 'PHONE', 'NUMBER', 'CURRENCY', 'DATE', 'LINK', 'SELECT', 'RADIO', 'CHECKBOX', 'TEXTAREA', 'MULTISELECT') NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `required` BOOLEAN NOT NULL DEFAULT true,
    `placeholder` VARCHAR(191) NULL,
    `defaultValue` VARCHAR(191) NULL,
    `validationRules` TEXT NULL,
    `options` TEXT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `FormField_leadCollectionId_idx`(`leadCollectionId`),
    INDEX `FormField_order_idx`(`order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Logic` ADD CONSTRAINT `Logic_chatbotId_fkey` FOREIGN KEY (`chatbotId`) REFERENCES `Chatbot`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LinkButton` ADD CONSTRAINT `LinkButton_logicId_fkey` FOREIGN KEY (`logicId`) REFERENCES `Logic`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MeetingSchedule` ADD CONSTRAINT `MeetingSchedule_logicId_fkey` FOREIGN KEY (`logicId`) REFERENCES `Logic`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeadCollection` ADD CONSTRAINT `LeadCollection_logicId_fkey` FOREIGN KEY (`logicId`) REFERENCES `Logic`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FormField` ADD CONSTRAINT `FormField_leadCollectionId_fkey` FOREIGN KEY (`leadCollectionId`) REFERENCES `LeadCollection`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
