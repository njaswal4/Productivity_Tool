import { db } from 'src/lib/db'

export const attendanceBreaks = ({ attendanceId }) => {
  return db.attendanceBreak.findMany({
    where: { attendanceId },
    orderBy: { breakIn: 'asc' },
  })
}

export const attendanceBreak = ({ id }) => {
  return db.attendanceBreak.findUnique({
    where: { id },
  })
}

export const attendanceBreaksForUserInRange = ({ userId, start, end }) => {
  return db.attendanceBreak.findMany({
    where: {
      attendance: {
        userId,
        date: {
          gte: start,
          lte: end,
        },
      },
    },
    orderBy: { breakIn: 'asc' },
  })
}

export const createAttendanceBreak = ({ input }) => {
  return db.attendanceBreak.create({
    data: input,
  })
}

export const updateAttendanceBreak = ({ id, input }) => {
  return db.attendanceBreak.update({
    data: input,
    where: { id },
  })
}

export const deleteAttendanceBreak = ({ id }) => {
  return db.attendanceBreak.delete({
    where: { id },
  })
}

export const AttendanceBreak = {
  attendance: (_obj, { root }) => {
    return db.attendanceBreak
      .findUnique({ where: { id: root?.id } })
      .attendance()
  },
}
