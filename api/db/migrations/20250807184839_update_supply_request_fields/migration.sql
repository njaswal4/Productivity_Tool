/*
  Warnings:

  - You are about to drop the column `quantity` on the `SupplyRequest` table. All the data in the column will be lost.
  - You are about to drop the column `reason` on the `SupplyRequest` table. All the data in the column will be lost.
  - Added the required column `justification` to the `SupplyRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantityRequested` to the `SupplyRequest` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add new columns with default values temporarily
ALTER TABLE "SupplyRequest" 
ADD COLUMN "approvedAt" TIMESTAMP(3),
ADD COLUMN "approverNotes" TEXT,
ADD COLUMN "isOverdue" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "justification" TEXT NOT NULL DEFAULT 'Migration from reason field',
ADD COLUMN "quantityRequested" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "totalCost" DOUBLE PRECISION,
ADD COLUMN "urgency" TEXT NOT NULL DEFAULT 'MEDIUM';

-- Step 2: Copy data from old columns to new columns
UPDATE "SupplyRequest" SET 
  "quantityRequested" = "quantity",
  "justification" = "reason";

-- Step 3: Drop the old columns
ALTER TABLE "SupplyRequest" 
DROP COLUMN "quantity",
DROP COLUMN "reason";

-- Step 4: Update status default
ALTER TABLE "SupplyRequest" ALTER COLUMN "status" SET DEFAULT 'PENDING';
