/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - Added the required column `image` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX `User_email_key` ON `User`;

-- AlterTable
ALTER TABLE `User` DROP PRIMARY KEY,
    DROP COLUMN `email`,
    ADD COLUMN `image` VARCHAR(191) NOT NULL,
    ADD COLUMN `isAdmin` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `token` VARCHAR(191) NOT NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `name` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- CreateTable
CREATE TABLE `Trivia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `content` TEXT NOT NULL,
    `hee` TINYINT UNSIGNED,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `userId` VARCHAR(191) NOT NULL,
    `broadcastId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Broadcast` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `scheduledStartTime` DATETIME NOT NULL,
    `liveType` VARCHAR(191) NOT NULL DEFAULT 'upcoming',
    `archiveUrl` VARCHAR(191),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Trivia` ADD CONSTRAINT `Trivia_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Trivia` ADD CONSTRAINT `Trivia_broadcastId_fkey` FOREIGN KEY (`broadcastId`) REFERENCES `Broadcast`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
