-- CreateTable
CREATE TABLE `LeadForm` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL DEFAULT 'Get started',
    `description` VARCHAR(191) NULL,
    `fields` JSON NOT NULL,
    `leadTiming` ENUM('BEGINNING', 'MIDDLE', 'END') NOT NULL DEFAULT 'BEGINNING',
    `leadFormStyle` ENUM('EMBEDDED', 'POPUP', 'MODAL') NOT NULL DEFAULT 'EMBEDDED',
    `chatbotId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `LeadForm_chatbotId_key`(`chatbotId`),
    INDEX `LeadForm_chatbotId_idx`(`chatbotId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lead` (
    `id` VARCHAR(191) NOT NULL,
    `data` JSON NOT NULL,
    `formId` VARCHAR(191) NOT NULL,
    `chatbotId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LeadForm` ADD CONSTRAINT `LeadForm_chatbotId_fkey` FOREIGN KEY (`chatbotId`) REFERENCES `Chatbot`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lead` ADD CONSTRAINT `Lead_formId_fkey` FOREIGN KEY (`formId`) REFERENCES `LeadForm`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lead` ADD CONSTRAINT `Lead_chatbotId_fkey` FOREIGN KEY (`chatbotId`) REFERENCES `Chatbot`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
