import { db } from 'src/lib/db'

export const exceptionRequests = ({ userId }) => {
  return db.exceptionRequest.findMany({
    where: userId ? { userId } : {},
    orderBy: { createdAt: 'desc' },
    include: { user: true },
  })
}

export const exceptionRequest = ({ id }) => {
  return db.exceptionRequest.findUnique({
    where: { id },
  })
}

export const createExceptionRequest = ({ input }) => {
  return db.exceptionRequest.create({
    data: input,
  })
}

export const updateExceptionRequest = ({ id, input }) => {
  return db.exceptionRequest.update({
    data: input,
    where: { id },
  })
}

export const deleteExceptionRequest = ({ id }) => {
  return db.exceptionRequest.delete({
    where: { id },
  })
}

export const ExceptionRequest = {
  user: (_obj, { root }) => {
    return db.exceptionRequest.findUnique({ where: { id: root?.id } }).user()
  },
}
