-- AlterTable
ALTER TABLE "VacationRequest" ADD COLUMN     "originalRequestId" INTEGER,
ADD COLUMN     "rejectionReason" TEXT;

-- AddForeignKey
ALTER TABLE "VacationRequest" ADD CONSTRAINT "VacationRequest_originalRequestId_fkey" FOREIGN KEY ("originalRequestId") REFERENCES "VacationRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
