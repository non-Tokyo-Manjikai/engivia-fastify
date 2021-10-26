/*
  Warnings:

  - You are about to alter the column `scheduledStartTime` on the `Broadcast` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - A unique constraint covering the columns `[token]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Broadcast` MODIFY `scheduledStartTime` DATETIME NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_token_key` ON `User`(`token`);
