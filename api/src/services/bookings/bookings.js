import { db } from 'src/lib/db'
import { AuthenticationError } from '@redwoodjs/graphql-server'

export const bookings = ({ userId }, { context }) => {
  const resolvedUserId = userId || context.currentUser?.id

  if (!resolvedUserId) {
    throw new AuthenticationError('You must be logged in to view bookings.')
  }

  return db.booking.findMany({
    where: { userId: resolvedUserId },
    orderBy: { startTime: 'asc' },
    include: { user: true, meetingRoom: true },
  })
}

export const booking = ({ id }) => {
  return db.booking.findUnique({
    where: { id },
  })
}

export const createBooking = async ({ input }) => {
  const overlap = await db.booking.findFirst({
    where: {
      startTime: { lt: input.endTime },
      endTime: { gt: input.startTime },
    },
  })

  if (overlap) {
    throw new Error('Time slot already booked.')
  }

  return db.booking.create({ data: input })
}

export const updateBooking = ({ id, input }) => {
  return db.booking.update({
    data: input,
    where: { id },
  })
}

export const deleteBooking = ({ id }) => {
  return db.booking.delete({
    where: { id },
  })
}

export const Booking = {
  user: (_obj, { root }) => {
    return db.booking.findUnique({ where: { id: root?.id } }).user()
  },
  meetingRoom: (_obj, { root }) => {
    return db.booking.findUnique({ where: { id: root?.id } }).meetingRoom()
  },
}
