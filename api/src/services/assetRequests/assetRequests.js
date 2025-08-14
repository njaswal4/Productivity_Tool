import { db } from 'src/lib/db'
import { 
  sendAssetRequestApprovalEmail, 
  sendAssetRequestRejectionEmail,
  sendAssetRequestNotificationToAdmins
} from 'src/lib/emailService'

export const assetRequests = () => {
  return db.assetRequest.findMany({
    include: {
      user: true,
      assetCategory: true,
      specificAsset: {
        include: {
          category: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export const assetRequest = ({ id }) => {
  return db.assetRequest.findUnique({
    where: { id },
    include: {
      user: true,
      assetCategory: true,
      specificAsset: {
        include: {
          category: true,
        },
      },
    },
  })
}

export const myAssetRequests = (_args, { context }) => {
  return db.assetRequest.findMany({
    where: {
      userId: context.currentUser.id,
    },
    include: {
      user: true,
      assetCategory: true,
      specificAsset: {
        include: {
          category: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export const pendingAssetRequests = () => {
  return db.assetRequest.findMany({
    where: {
      status: 'Pending',
    },
    include: {
      user: true,
      assetCategory: true,
      specificAsset: {
        include: {
          category: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export const createAssetRequest = ({ input }, { context }) => {
  return db.$transaction(async (tx) => {
    // Create the asset request
    const newRequest = await tx.assetRequest.create({
      data: {
        ...input,
        userId: context.currentUser.id,
      },
      include: {
        user: true,
        assetCategory: true,
        specificAsset: {
          include: {
            category: true,
          },
        },
      },
    })

    // Send notification to admins (run async without blocking the response)
    sendAssetRequestNotificationToAdmins(newRequest.user, newRequest, newRequest.assetCategory)
      .catch(error => {
        console.error('Failed to send admin notification for asset request:', error)
      })

    return newRequest
  })
}

export const updateAssetRequest = ({ id, input }, { context }) => {
  // Only allow users to update their own requests (unless admin)
  const isAdmin = context.currentUser.roles?.includes('ADMIN')
  const whereClause = isAdmin ? { id } : { id, userId: context.currentUser.id }

  return db.assetRequest.update({
    data: input,
    where: whereClause,
    include: {
      user: true,
      assetCategory: true,
      specificAsset: {
        include: {
          category: true,
        },
      },
    },
  })
}

export const deleteAssetRequest = ({ id }, { context }) => {
  // Only allow users to delete their own requests (unless admin)
  const isAdmin = context.currentUser.roles?.includes('ADMIN')
  const whereClause = isAdmin ? { id } : { id, userId: context.currentUser.id }

  return db.assetRequest.delete({
    where: whereClause,
  })
}

export const approveAssetRequest = async ({ id, input }, { context }) => {
  const approverName = context.currentUser.name || context.currentUser.email

  return await db.$transaction(async (prisma) => {
    // Get the request
    const request = await prisma.assetRequest.findUnique({
      where: { id },
      include: {
        user: true,
        assetCategory: true,
        specificAsset: true,
      },
    })

    if (!request) {
      throw new Error('Asset request not found')
    }

    if (request.status !== 'Pending') {
      throw new Error('Only pending requests can be approved')
    }

    // Update the request status
    const updatedRequest = await prisma.assetRequest.update({
      where: { id },
      data: {
        status: 'Approved',
        approvedBy: approverName,
        approvedAt: new Date(),
        fulfillmentNotes: input.fulfillmentNotes,
      },
      include: {
        user: true,
        assetCategory: true,
        specificAsset: {
          include: {
            category: true,
          },
        },
      },
    })

    // If a specific asset is assigned, create the assignment
    let assignedAsset = null
    if (input.assignAssetId) {
      // Check if the asset is available
      const asset = await prisma.asset.findUnique({
        where: { id: input.assignAssetId },
      })

      if (!asset) {
        throw new Error('Asset not found')
      }

      if (asset.status !== 'Available') {
        throw new Error('Asset is not available for assignment')
      }

      // Create asset assignment
      await prisma.assetAssignment.create({
        data: {
          assetId: input.assignAssetId,
          userId: request.userId,
          issuedBy: approverName,
          issueNotes: `Assigned through asset request: ${request.reason}`,
          status: 'Active',
          condition: 'Good', // Default condition
          issueDate: new Date(),
        },
      })

      // Update asset status
      await prisma.asset.update({
        where: { id: input.assignAssetId },
        data: { status: 'Assigned' },
      })

      // Update request status to fulfilled
      await prisma.assetRequest.update({
        where: { id },
        data: { status: 'Fulfilled' },
      })

      assignedAsset = asset
    }

    // Send approval email notification
    try {
      await sendAssetRequestApprovalEmail(
        updatedRequest.user, 
        updatedRequest, 
        assignedAsset, 
        input.fulfillmentNotes
      )
      console.log('✅ Approval email sent for asset request:', id)
    } catch (emailError) {
      console.error('⚠️ Failed to send approval email:', emailError)
      // Don't fail the entire operation if email fails
    }

    return updatedRequest
  })
}

export const rejectAssetRequest = async ({ id, input }, { context }) => {
  const approverName = context.currentUser.name || context.currentUser.email

  const updatedRequest = await db.assetRequest.update({
    where: { id },
    data: {
      status: 'Rejected',
      approvedBy: approverName,
      approvedAt: new Date(),
      rejectionReason: input.rejectionReason,
    },
    include: {
      user: true,
      assetCategory: true,
      specificAsset: {
        include: {
          category: true,
        },
      },
    },
  })

  // Send rejection email notification
  try {
    await sendAssetRequestRejectionEmail(
      updatedRequest.user, 
      updatedRequest, 
      input.rejectionReason
    )
    console.log('✅ Rejection email sent for asset request:', id)
  } catch (emailError) {
    console.error('⚠️ Failed to send rejection email:', emailError)
    // Don't fail the entire operation if email fails
  }

  return updatedRequest
}

export const AssetRequest = {
  user: (_obj, { root }) => {
    return db.assetRequest.findUnique({ where: { id: root?.id } }).user()
  },
  assetCategory: (_obj, { root }) => {
    return db.assetRequest.findUnique({ where: { id: root?.id } }).assetCategory()
  },
  specificAsset: (_obj, { root }) => {
    return db.assetRequest.findUnique({ where: { id: root?.id } }).specificAsset()
  },
}
