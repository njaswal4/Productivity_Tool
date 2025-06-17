-- CreateTable
CREATE TABLE "Break" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "attendanceId" INTEGER NOT NULL,
    "breakIn" DATETIME NOT NULL,
    "breakOut" DATETIME,
    "duration" TEXT,
    CONSTRAINT "Break_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "Attendance" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OvertimeAttendance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "clockIn" DATETIME,
    "clockOut" DATETIME,
    "duration" TEXT,
    CONSTRAINT "OvertimeAttendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OvertimeBreak" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "overtimeId" INTEGER NOT NULL,
    "breakIn" DATETIME NOT NULL,
    "breakOut" DATETIME,
    "duration" TEXT,
    CONSTRAINT "OvertimeBreak_overtimeId_fkey" FOREIGN KEY ("overtimeId") REFERENCES "OvertimeAttendance" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
