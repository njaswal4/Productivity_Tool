/*
  Warnings:

  - A unique constraint covering the columns `[employeeId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Department" AS ENUM ('ENGINEERING', 'DESIGN', 'MARKETING', 'SALES', 'HR', 'FINANCE', 'OPERATIONS');

-- CreateEnum
CREATE TYPE "EmployeeDesignation" AS ENUM ('JUNIOR_DEVELOPER', 'SENIOR_DEVELOPER', 'LEAD_DEVELOPER', 'ARCHITECT', 'DESIGNER', 'SENIOR_DESIGNER', 'MARKETING_SPECIALIST', 'SALES_REPRESENTATIVE', 'HR_SPECIALIST', 'ACCOUNTANT', 'PROJECT_MANAGER', 'PRODUCT_MANAGER');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'MANAGER';
ALTER TYPE "Role" ADD VALUE 'TEAM_LEAD';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dateOfJoining" TIMESTAMP(3),
ADD COLUMN     "department" "Department",
ADD COLUMN     "designation" "EmployeeDesignation",
ADD COLUMN     "employeeId" TEXT,
ADD COLUMN     "reportingManager" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "User_employeeId_key" ON "User"("employeeId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_reportingManager_fkey" FOREIGN KEY ("reportingManager") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
