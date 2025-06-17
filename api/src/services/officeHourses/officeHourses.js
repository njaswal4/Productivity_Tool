import { db } from 'src/lib/db'

export const officeHourses = () => {
  return db.officeHours.findMany()
}

export const officeHours = ({ id }) => {
  return db.officeHours.findUnique({
    where: { id },
  })
}

export const createOfficeHours = ({ input }) => {
  return db.officeHours.create({
    data: input,
  })
}

export const updateOfficeHours = ({ id, input }) => {
  return db.officeHours.update({
    data: input,
    where: { id },
  })
}

export const deleteOfficeHours = ({ id }) => {
  return db.officeHours.delete({
    where: { id },
  })
}
