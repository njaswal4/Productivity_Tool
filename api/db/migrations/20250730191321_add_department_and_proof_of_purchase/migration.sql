-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "proofOfPurchaseFileName" TEXT,
ADD COLUMN     "proofOfPurchaseType" TEXT,
ADD COLUMN     "proofOfPurchaseUrl" TEXT;

-- AlterTable
ALTER TABLE "AssetAssignment" ADD COLUMN     "department" TEXT;
