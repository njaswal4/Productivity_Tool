import { db } from 'src/lib/db'

export const overtimeBreaks = () => {
  return db.overtimeBreak.findMany()
}

export const overtimeBreak = ({ id }) => {
  return db.overtimeBreak.findUnique({
    where: { id },
  })
}

export const createOvertimeBreak = ({ input }) => {
  return db.overtimeBreak.create({
    data: input,
  })
}

export const updateOvertimeBreak = ({ id, input }) => {
  return db.overtimeBreak.update({
    data: input,
    where: { id },
  })
}

export const deleteOvertimeBreak = ({ id }) => {
  return db.overtimeBreak.delete({
    where: { id },
  })
}

export const OvertimeBreak = {
  overtime: (_obj, { root }) => {
    return db.overtimeBreak.findUnique({ where: { id: root?.id } }).overtime()
  },
}
