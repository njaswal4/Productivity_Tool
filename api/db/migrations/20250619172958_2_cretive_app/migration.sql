-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL DEFAULT '',
    "salt" TEXT NOT NULL DEFAULT '',
    "resetToken" TEXT,
    "resetTokenExpiresAt" TIMESTAMP(3),
    "selectedMeetingRoomId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "meetingRoomId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingRoom" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "MeetingRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "clockIn" TIMESTAMP(3),
    "clockOut" TIMESTAMP(3),
    "duration" TEXT,
    "status" TEXT NOT NULL,
    "location" TEXT,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceBreak" (
    "id" SERIAL NOT NULL,
    "attendanceId" INTEGER NOT NULL,
    "breakIn" TIMESTAMP(3) NOT NULL,
    "breakOut" TIMESTAMP(3),
    "duration" TEXT,

    CONSTRAINT "AttendanceBreak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OvertimeAttendance" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "clockIn" TIMESTAMP(3),
    "clockOut" TIMESTAMP(3),
    "duration" TEXT,

    CONSTRAINT "OvertimeAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OvertimeBreak" (
    "id" SERIAL NOT NULL,
    "overtimeId" INTEGER NOT NULL,
    "breakIn" TIMESTAMP(3) NOT NULL,
    "breakOut" TIMESTAMP(3),
    "duration" TEXT,

    CONSTRAINT "OvertimeBreak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExceptionRequest" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExceptionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfficeHours" (
    "id" SERIAL NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfficeHours_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MeetingRoom_name_key" ON "MeetingRoom"("name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_selectedMeetingRoomId_fkey" FOREIGN KEY ("selectedMeetingRoomId") REFERENCES "MeetingRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_meetingRoomId_fkey" FOREIGN KEY ("meetingRoomId") REFERENCES "MeetingRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceBreak" ADD CONSTRAINT "AttendanceBreak_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OvertimeAttendance" ADD CONSTRAINT "OvertimeAttendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OvertimeBreak" ADD CONSTRAINT "OvertimeBreak_overtimeId_fkey" FOREIGN KEY ("overtimeId") REFERENCES "OvertimeAttendance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExceptionRequest" ADD CONSTRAINT "ExceptionRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
