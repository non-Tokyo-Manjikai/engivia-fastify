/*
  Warnings:

  - You are about to alter the column `scheduledStartTime` on the `Broadcast` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `Broadcast` MODIFY `scheduledStartTime` DATETIME NOT NULL;
