import { db } from 'src/lib/db'
import { 
  sendVacationRequestApprovalEmail, 
  sendVacationRequestRejectionEmail,
  sendVacationRequestNotificationToAdmins
} from 'src/lib/emailService'

export const vacationRequests = () => {
  return db.vacationRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true },
  })
}

export const vacationRequest = ({ id }) => {
  return db.vacationRequest.findUnique({
    where: { id },
    include: { user: true },
  })
}

export const userVacationRequests = (_args, { context }) => {
  console.log('🏖️ userVacationRequests called')
  console.log('🔍 context exists:', !!context)
  console.log('🔍 context.currentUser exists:', !!context?.currentUser)
  console.log('🔍 context.currentUser.id:', context?.currentUser?.id)
  
  if (!context?.currentUser?.id) {
    console.log('❌ No currentUser.id found in context')
    throw new Error('User not authenticated or missing user ID')
  }
  
  const userId = context.currentUser.id
  console.log('✅ Using userId:', userId)
  
  return db.vacationRequest.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      originalRequest: true,
      resubmissions: true,
    }
  })
}

export const createVacationRequest = ({ input }, { context }) => {
  return db.$transaction(async (tx) => {
    const userId = context.currentUser.id
    
    // Create the vacation request
    const newRequest = await tx.vacationRequest.create({
      data: {
        ...input,
        userId,
      },
      include: {
        user: true,
      },
    })

    // Send notification to admins (run async without blocking the response)
    sendVacationRequestNotificationToAdmins(newRequest.user, newRequest)
      .catch(error => {
        console.error('Failed to send admin notification for vacation request:', error)
      })

    return newRequest
  })
}

export const updateVacationRequest = ({ id, input }, { context }) => {
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

  // For other status changes, admin authorization is handled by GraphQL @requireAuth directive
  return db.vacationRequest.update({
    data: input,
    where: { id },
  })
}

export const approveVacationRequest = async ({ id }) => {
  const updatedRequest = await db.vacationRequest.update({
    data: { status: 'Approved' },
    where: { id },
    include: { user: true },
  })

  // Send approval email notification
  try {
    await sendVacationRequestApprovalEmail(updatedRequest.user, updatedRequest)
    console.log('✅ Approval email sent for vacation request:', id)
  } catch (emailError) {
    console.error('⚠️ Failed to send approval email:', emailError)
    // Don't fail the entire operation if email fails
  }

  return updatedRequest
}

export const rejectVacationRequest = async ({ id, input }) => {
  const updatedRequest = await db.vacationRequest.update({
    data: { 
      status: 'Rejected',
      rejectionReason: input.rejectionReason
    },
    where: { id },
    include: { user: true },
  })

  // Send rejection email notification
  try {
    await sendVacationRequestRejectionEmail(updatedRequest.user, updatedRequest)
    console.log('✅ Rejection email sent for vacation request:', id)
  } catch (emailError) {
    console.error('⚠️ Failed to send rejection email:', emailError)
    // Don't fail the entire operation if email fails
  }

  return updatedRequest
}

export const resubmitVacationRequest = async ({ originalId, input }, { context }) => {
  return db.$transaction(async (tx) => {
    const userId = context.currentUser.id
    
    // Verify the original request belongs to the current user and was rejected
    const originalRequest = await tx.vacationRequest.findUnique({
      where: { id: originalId },
      include: { user: true }
    })
    
    if (!originalRequest) {
      throw new Error('Original vacation request not found')
    }
    
    if (originalRequest.userId !== userId) {
      throw new Error('You can only resubmit your own vacation requests')
    }
    
    if (originalRequest.status !== 'Rejected') {
      throw new Error('You can only resubmit rejected vacation requests')
    }
    
    // Create the new resubmission request
    const newRequest = await tx.vacationRequest.create({
      data: {
        ...input,
        userId,
        originalRequestId: originalId,
        status: 'Pending'
      },
      include: {
        user: true,
        originalRequest: true
      }
    })

    // Send notification to admins about the resubmission
    sendVacationRequestNotificationToAdmins(newRequest.user, newRequest)
      .catch(error => {
        console.error('Failed to send admin notification for vacation resubmission:', error)
      })

    return newRequest
  })
}

// Example: Make sure the delete service returns all fields needed by the cache

export const deleteVacationRequest = async ({ id }) => {
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
