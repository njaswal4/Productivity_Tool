import { AuthenticationError } from '@redwoodjs/graphql-server'
import { hashPassword, verifyPassword } from '@redwoodjs/auth-dbauth-api'
import { db } from 'src/lib/db'

export const users = () => {
  return db.user.findMany()
}

export const user = ({ id }) => {
  return db.user.findUnique({
    where: { id },
    include: { exceptionRequests: true },
  })
}

export const createUser = ({ input }) => {
  return db.user.create({
    data: input,
  })
}

export const updateUser = ({ id, input }) => {
  return db.user.update({
    data: input,
    where: { id },
  })
}

export const deleteUser = ({ id }) => {
  return db.user.delete({
    where: { id },
  })
}

export const updateUserRoles = ({ id, roles }) => {
  return db.user.update({
    where: { id },
    data: { roles },
  })
}

export const User = {
  bookings: (_obj, { root }) => {
    return db.user.findUnique({ where: { id: root?.id } }).bookings()
  },
  attendancesInRange: (user, { start, end }) => {
    if (!user?.id || !start || !end || isNaN(new Date(start)) || isNaN(new Date(end))) {
      return []
    }
    return db.attendance.findMany({
      where: {
        userId: user.id,
        date: {
          gte: new Date(start),
          lte: new Date(end),
        },
      },
    })
  },
  attendances: async (user) => {
    const records = await db.attendance.findMany({ where: { userId: user.id } })
    console.log('User:', user.id, 'Attendances:', records)
    return records || []
  },
}

