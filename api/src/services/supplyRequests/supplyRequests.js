import { db } from 'src/lib/db'
import { requireAuth } from 'src/lib/auth'
import { ForbiddenError, ValidationError } from '@redwoodjs/graphql-server'
import { context } from '@redwoodjs/graphql-server'
import { 
  sendSupplyRequestApprovalEmail, 
  sendSupplyRequestRejectionEmail,
  sendSupplyRequestNotificationToAdmins
} from 'src/lib/emailService'

export const supplyRequests = () => {
  requireAuth()
  
  // Check if user is admin
  const isAdmin = context.currentUser.roles?.includes('ADMIN')
  if (!isAdmin) {
    throw new ForbiddenError('Only administrators can view all supply requests')
  }
  
  return db.supplyRequest.findMany({
    include: {
      user: true,
      supply: {
        include: {
          category: true,
        },
      },
    },
  })
}

export const supplyRequest = ({ id }) => {
  return db.supplyRequest.findUnique({
    where: { id },
    include: {
      user: true,
      supply: {
        include: {
          category: true,
        },
      },
    },
  })
}

// Get supply requests for the current user
export const mySupplyRequests = () => {
  requireAuth()
  const userId = context.currentUser.id

  return db.supplyRequest.findMany({
    where: { userId },
    include: {
      user: true,
      supply: {
        include: {
          category: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

// Get pending supply requests (for admins)
export const pendingSupplyRequests = () => {
  requireAuth()
  
  // Check if user is admin
  const isAdmin = context.currentUser.roles?.includes('ADMIN')
  if (!isAdmin) {
    throw new ForbiddenError('Only administrators can view pending supply requests')
  }
  
  return db.supplyRequest.findMany({
    where: { 
      status: 'PENDING' 
    },
    include: {
      user: true,
      supply: {
        include: {
          category: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' }, // Oldest first for FIFO processing
  })
}

export const createSupplyRequest = ({ input }) => {
  requireAuth()
  const userId = context.currentUser.id

  return db.$transaction(async (tx) => {
    // Validate supply exists
    const supply = await tx.officeSupply.findUnique({
      where: { id: input.supplyId },
      include: {
        category: true,
      },
    })

    if (!supply) {
      throw new ValidationError('Office supply not found')
    }

    // Create the supply request
    const newRequest = await tx.supplyRequest.create({
      data: {
        ...input,
        userId,
        status: 'PENDING',
      },
      include: {
        user: true,
        supply: {
          include: {
            category: true,
          },
        },
      },
    })

    // Send notification to admins (run async without blocking the response)
    sendSupplyRequestNotificationToAdmins(newRequest.user, newRequest, supply)
      .catch(error => {
        console.error('Failed to send admin notification for supply request:', error)
      })

    return newRequest
  })
}

export const updateSupplyRequest = ({ id, input }) => {
  requireAuth()
  const userId = context.currentUser.id

  return db.$transaction(async (tx) => {
    const existingRequest = await tx.supplyRequest.findUnique({ 
      where: { id },
      include: { user: true }
    })

    if (!existingRequest) {
      throw new ValidationError('Supply request not found')
    }

    // Only allow the requester to update their own pending requests
    if (existingRequest.userId !== userId && existingRequest.status !== 'PENDING') {
      throw new ForbiddenError('You can only update your own pending requests')
    }

    // Prevent updating approved/rejected requests
    if (existingRequest.status !== 'PENDING') {
      throw new ValidationError('Cannot update non-pending requests')
    }

    return tx.supplyRequest.update({
      data: input,
      where: { id },
      include: {
        user: true,
        supply: {
          include: {
            category: true,
          },
        },
      },
    })
  })
}

export const deleteSupplyRequest = ({ id }) => {
  requireAuth()
  const userId = context.currentUser.id

  return db.$transaction(async (tx) => {
    const existingRequest = await tx.supplyRequest.findUnique({ 
      where: { id },
      include: { user: true }
    })

    if (!existingRequest) {
      throw new ValidationError('Supply request not found')
    }

    // Only allow the requester to delete their own pending requests
    if (existingRequest.userId !== userId) {
      throw new ForbiddenError('You can only delete your own requests')
    }

    // Prevent deleting approved requests
    if (existingRequest.status === 'APPROVED') {
      throw new ValidationError('Cannot delete approved requests')
    }

    return tx.supplyRequest.delete({
      where: { id },
    })
  })
}

// Approve supply request (admin function)
export const approveSupplyRequest = async ({ id, approverNotes }) => {
  requireAuth()
  
  // Check if user is admin
  const isAdmin = context.currentUser.roles?.includes('ADMIN')
  if (!isAdmin) {
    throw new ForbiddenError('Only administrators can approve supply requests')
  }
  
  return db.$transaction(async (tx) => {
    const request = await tx.supplyRequest.findUnique({
      where: { id },
      include: { 
        supply: {
          include: {
            category: true,
          },
        },
        user: true
      }
    })

    if (!request) {
      throw new ValidationError('Supply request not found')
    }

    if (request.status !== 'PENDING') {
      throw new ValidationError('Only pending requests can be approved')
    }

    // Check if there's enough stock
    if (request.supply.stockCount < request.quantityRequested) {
      throw new ValidationError('Insufficient stock to fulfill this request')
    }

    // Update stock level
    await tx.officeSupply.update({
      where: { id: request.supplyId },
      data: {
        stockCount: request.supply.stockCount - request.quantityRequested,
      },
    })

    // Update request status
    const updatedRequest = await tx.supplyRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approverNotes,
      },
      include: {
        user: true,
        supply: {
          include: {
            category: true,
          },
        },
      },
    })

    // Send approval email notification
    try {
      await sendSupplyRequestApprovalEmail(updatedRequest.user, updatedRequest, approverNotes)
      console.log('✅ Approval email sent for supply request:', id)
    } catch (emailError) {
      console.error('⚠️ Failed to send approval email:', emailError)
      // Don't fail the entire operation if email fails
    }

    return updatedRequest
  })
}

// Reject supply request (admin function)
export const rejectSupplyRequest = async ({ id, approverNotes }) => {
  requireAuth()
  
  // Check if user is admin
  const isAdmin = context.currentUser.roles?.includes('ADMIN')
  if (!isAdmin) {
    throw new ForbiddenError('Only administrators can reject supply requests')
  }
  
  const updatedRequest = await db.supplyRequest.update({
    where: { id },
    data: {
      status: 'REJECTED',
      approvedAt: new Date(),
      approverNotes,
    },
    include: {
      user: true,
      supply: {
        include: {
          category: true,
        },
      },
    },
  })

  // Send rejection email notification
  try {
    await sendSupplyRequestRejectionEmail(updatedRequest.user, updatedRequest, approverNotes)
    console.log('✅ Rejection email sent for supply request:', id)
  } catch (emailError) {
    console.error('⚠️ Failed to send rejection email:', emailError)
    // Don't fail the entire operation if email fails
  }

  return updatedRequest
}

export const SupplyRequest = {
  user: (_obj, { root }) => {
    return db.supplyRequest
      .findUnique({ where: { id: root?.id } })
      .user()
  },
  
  supply: (_obj, { root }) => {
    return db.supplyRequest
      .findUnique({ where: { id: root?.id } })
      .supply()
  },
  
  // Calculate total cost
  totalCost: (obj) => {
    if (obj.supply && obj.supply.unitPrice) {
      return obj.quantityRequested * obj.supply.unitPrice
    }
    return null
  },
  
  // Check if request is overdue (pending for more than 7 days)
  isOverdue: (obj) => {
    if (obj.status !== 'PENDING') return false
    
    const daysDiff = Math.floor((new Date() - new Date(obj.createdAt)) / (1000 * 60 * 60 * 24))
    return daysDiff > 7
  },
}
