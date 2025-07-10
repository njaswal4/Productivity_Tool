import { db } from 'src/lib/db'
import { requireAuth } from 'src/lib/auth'

export const vacationRequests = () => {
  requireAuth({ role: 'ADMIN' })
  return db.vacationRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true },
  })
}

export const vacationRequest = ({ id }) => {
  requireAuth()
  return db.vacationRequest.findUnique({
    where: { id },
    include: { user: true },
  })
}

export const userVacationRequests = () => {
  requireAuth()
  const userId = context.currentUser.id
  return db.vacationRequest.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}

export const createVacationRequest = ({ input }) => {
  requireAuth()
  const userId = context.currentUser.id
  return db.vacationRequest.create({
    data: {
      ...input,
      userId,
    },
  })
}

export const updateVacationRequest = ({ id, input }) => {
  // Allow users to cancel their own approved requests
  if (input.status === 'Cancelled') {
    const userId = context.currentUser.id
    const request = db.vacationRequest.findUnique({ where: { id } })

    // If it's the user's own request, allow the cancellation
    if (request.userId === userId) {
      return db.vacationRequest.update({
        data: { status: 'Cancelled' },
        where: { id },
      })
    }
  }

  // For other status changes, require admin
  requireAuth({ role: 'ADMIN' })
  return db.vacationRequest.update({
    data: input,
    where: { id },
  })
}

export const approveVacationRequest = ({ id }) => {
  requireAuth({ role: 'ADMIN' })
  return db.vacationRequest.update({
    data: { status: 'Approved' },
    where: { id },
  })
}

export const rejectVacationRequest = ({ id }) => {
  requireAuth({ role: 'ADMIN' })
  return db.vacationRequest.update({
    data: { status: 'Rejected' },
    where: { id },
    include: { user: true },
  })
}

// Example: Make sure the delete service returns all fields needed by the cache

export const deleteVacationRequest = async ({ id }) => {
  requireAuth()

  // Get the vacation request first so we can return it after deletion
  const vacationRequest = await db.vacationRequest.findUnique({
    where: { id },
  })

  // Delete the request
  await db.vacationRequest.delete({
    where: { id },
  })

  // Return the deleted request (for cache updates)
  return vacationRequest
}

export const VacationRequest = {
  user: (_obj, { root }) => {
    return db.vacationRequest.findUnique({ where: { id: root?.id } }).user()
  },
}
