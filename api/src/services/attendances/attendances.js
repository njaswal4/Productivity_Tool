import { db } from 'src/lib/db'

export const attendances = ({ userId, date }) => {
  const where = {}
  if (userId) where.userId = userId
  if (date) where.date = new Date(date)
  return db.attendance.findMany({
    where,
    orderBy: { date: 'desc' },
    include: { breaks: true }, // Include breaks for each attendance
  })
}

export const attendance = ({ id }) => {
  return db.attendance.findUnique({
    where: { id },
    include: { breaks: true }, // Include breaks for single attendance
  })
}

export const attendancesInRange = ({ userId, start, end }) => {
  return db.attendance.findMany({
    where: {
      userId,
      date: {
        gte: new Date(start),
        lte: new Date(end),
      },
    },
    orderBy: { date: 'asc' },
    include: { breaks: true }, // Include breaks for each attendance
  })
}

export const createAttendance = ({ input }) => {
  return db.attendance.create({
    data: input,
  })
}

export const updateAttendance = ({ id, input }) => {
  return db.attendance.update({
    data: input,
    where: { id },
  })
}

export const deleteAttendance = ({ id }) => {
  return db.attendance.delete({
    where: { id },
  })
}

export const Attendance = {
  breaks: (_obj, { root }) => {
    return db.attendance
      .findUnique({ where: { id: root.id } })
      .breaks()
  },
}
