/*
  Warnings:

  - You are about to drop the column `statusUpdate` on the `DailyProjectUpdate` table. All the data in the column will be lost.
  - You are about to drop the column `updateDate` on the `DailyProjectUpdate` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[allocationId,date]` on the table `DailyProjectUpdate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `DailyProjectUpdate` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "DailyProjectUpdate_allocationId_updateDate_key";

-- AlterTable
ALTER TABLE "DailyProjectUpdate" DROP COLUMN "statusUpdate",
DROP COLUMN "updateDate",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ON_TRACK';

-- CreateIndex
CREATE UNIQUE INDEX "DailyProjectUpdate_allocationId_date_key" ON "DailyProjectUpdate"("allocationId", "date");
