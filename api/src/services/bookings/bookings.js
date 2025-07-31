import { db } from 'src/lib/db'
import { AuthenticationError } from '@redwoodjs/graphql-server'
import { context } from '@redwoodjs/graphql-server'

export const bookings = ({ userId }) => {
  console.log('\n=== BOOKINGS SERVICE START ===')
  console.log('Timestamp:', new Date().toISOString())
  console.log('context.currentUser:', context?.currentUser ? 'PRESENT' : 'MISSING')
  console.log('userId parameter:', userId)
  console.log('context keys:', context ? Object.keys(context) : 'no context')

  if (context?.currentUser) {
    console.log('Current user details:', {
      id: context.currentUser.id,
      email: context.currentUser.email
    })
  }

  // Use currentUser.id if available, otherwise use passed userId
  const resolvedUserId = context?.currentUser?.id || userId

  if (!resolvedUserId) {
    console.log('❌ No user ID found - authentication required')
    throw new AuthenticationError('You must be logged in to view bookings.')
  }

  console.log('✅ Fetching bookings for userId:', resolvedUserId)
  console.log('=== BOOKINGS SERVICE END ===\n')

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
