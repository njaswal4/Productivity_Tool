import { db } from 'src/lib/db'

export const overtimeAttendances = () => {
  return db.overtimeAttendance.findMany()
}

export const overtimeAttendance = ({ id }) => {
  return db.overtimeAttendance.findUnique({
    where: { id },
  })
}

export const createOvertimeAttendance = ({ input }) => {
  return db.overtimeAttendance.create({
    data: input,
  })
}

export const updateOvertimeAttendance = ({ id, input }) => {
  return db.overtimeAttendance.update({
    data: input,
    where: { id },
  })
}

export const deleteOvertimeAttendance = ({ id }) => {
  return db.overtimeAttendance.delete({
    where: { id },
  })
}

export const OvertimeAttendance = {
  user: (_obj, { root }) => {
    return db.overtimeAttendance.findUnique({ where: { id: root?.id } }).user()
  },
  breaks: (_obj, { root }) => {
    return db.overtimeAttendance
      .findUnique({ where: { id: root?.id } })
      .breaks()
  },
}
