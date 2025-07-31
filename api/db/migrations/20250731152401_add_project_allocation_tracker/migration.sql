-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "estimatedHours" DOUBLE PRECISION,
    "managerId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectAllocation" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "allocatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT,
    "hoursAllocated" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "allocatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMeeting" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "meetingDate" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "location" TEXT,
    "meetingType" TEXT NOT NULL DEFAULT 'Standup',
    "projectId" INTEGER NOT NULL,
    "organizerId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'Scheduled',
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "attendeeIds" INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectMeeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyProjectUpdate" (
    "id" SERIAL NOT NULL,
    "allocationId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "updateDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusUpdate" TEXT NOT NULL,
    "hoursWorked" DOUBLE PRECISION,
    "blockers" TEXT,
    "nextDayPlan" TEXT,
    "completionPercentage" DOUBLE PRECISION,
    "milestoneReached" TEXT,
    "meetingsAttended" INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyProjectUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_code_key" ON "Project"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectAllocation_projectId_userId_allocatedDate_key" ON "ProjectAllocation"("projectId", "userId", "allocatedDate");

-- CreateIndex
CREATE UNIQUE INDEX "DailyProjectUpdate_allocationId_updateDate_key" ON "DailyProjectUpdate"("allocationId", "updateDate");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAllocation" ADD CONSTRAINT "ProjectAllocation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAllocation" ADD CONSTRAINT "ProjectAllocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAllocation" ADD CONSTRAINT "ProjectAllocation_allocatedBy_fkey" FOREIGN KEY ("allocatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMeeting" ADD CONSTRAINT "ProjectMeeting_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMeeting" ADD CONSTRAINT "ProjectMeeting_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyProjectUpdate" ADD CONSTRAINT "DailyProjectUpdate_allocationId_fkey" FOREIGN KEY ("allocationId") REFERENCES "ProjectAllocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyProjectUpdate" ADD CONSTRAINT "DailyProjectUpdate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
