import { db } from 'src/lib/db'

export const bookings = ({ userId }) => {
  if (userId) {
    return db.booking.findMany({
      where: { userId },
      orderBy: { startTime: 'asc' },
      include: { user: true },
    })
  }
  return db.booking.findMany({
    orderBy: { startTime: 'asc' },
    include: { user: true },
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
}
