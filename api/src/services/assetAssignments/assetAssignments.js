import { db } from 'src/lib/db'
import { requireAuth } from 'src/lib/auth'

export const assetAssignments = (args, { context }) => {
  requireAuth({}, context)
  return db.assetAssignment.findMany({
    include: {
      asset: {
        include: {
          category: true,
        },
      },
      user: true,
    },
    orderBy: {
      issueDate: 'desc',
    },
  })
}

export const assetAssignment = ({ id }, { context }) => {
  requireAuth({}, context)
  return db.assetAssignment.findUnique({
    where: { id },
    include: {
      asset: {
        include: {
          category: true,
        },
      },
      user: true,
    },
  })
}

export const activeAssetAssignments = (args, { context }) => {
  requireAuth({}, context)
  return db.assetAssignment.findMany({
    where: {
      status: 'Active',
    },
    include: {
      asset: {
        include: {
          category: true,
        },
      },
      user: true,
    },
    orderBy: {
      issueDate: 'desc',
    },
  })
}

export const assetAssignmentsByUser = ({ userId }, { context }) => {
  requireAuth({}, context)
  return db.assetAssignment.findMany({
    where: {
      userId,
    },
    include: {
      asset: {
        include: {
          category: true,
        },
      },
      user: true,
    },
    orderBy: {
      issueDate: 'desc',
    },
  })
}

export const assetAssignmentsByAsset = ({ assetId }, { context }) => {
  requireAuth({}, context)
  return db.assetAssignment.findMany({
    where: {
      assetId,
    },
    include: {
      asset: {
        include: {
          category: true,
        },
      },
      user: true,
    },
    orderBy: {
      issueDate: 'desc',
    },
  })
}

export const assetHistory = ({ assetId }, { context }) => {
  requireAuth({}, context)
  return db.assetAssignment.findMany({
    where: {
      assetId,
    },
    include: {
      user: true,
    },
    orderBy: {
      issueDate: 'desc',
    },
  })
}

export const createAssetAssignment = async ({ input }, { context }) => {
  requireAuth({ roles: ['ADMIN'] }, context)
  
  // Check if asset is available
  const asset = await db.asset.findUnique({
    where: { id: input.assetId },
    include: {
      assignments: {
        where: {
          status: 'Active',
        },
      },
    },
  })

  if (!asset) {
    throw new Error('Asset not found')
  }

  if (asset.assignments.length > 0) {
    throw new Error('Asset is already assigned to another user')
  }

  // Create assignment and update asset status
  const [assignment] = await db.$transaction([
    db.assetAssignment.create({
      data: {
        ...input,
        status: 'Active',
      },
      include: {
        asset: {
          include: {
            category: true,
          },
        },
        user: true,
      },
    }),
    db.asset.update({
      where: { id: input.assetId },
      data: { status: 'Assigned' },
    }),
  ])

  return assignment
}

export const updateAssetAssignment = ({ id, input }, { context }) => {
  requireAuth({ roles: ['ADMIN'] }, context)
  return db.assetAssignment.update({
    data: input,
    where: { id },
    include: {
      asset: {
        include: {
          category: true,
        },
      },
      user: true,
    },
  })
}

export const returnAsset = async ({ assignmentId, input }, { context }) => {
  requireAuth({ roles: ['ADMIN'] }, context)
  
  const assignment = await db.assetAssignment.findUnique({
    where: { id: assignmentId },
    include: {
      asset: true,
    },
  })

  if (!assignment) {
    throw new Error('Assignment not found')
  }

  if (assignment.status !== 'Active') {
    throw new Error('Asset is not currently assigned')
  }

  // Update assignment and asset status
  const [updatedAssignment] = await db.$transaction([
    db.assetAssignment.update({
      where: { id: assignmentId },
      data: {
        returnDate: new Date(),
        returnedBy: input.returnedBy,
        returnNotes: input.returnNotes,
        condition: input.condition,
        status: 'Returned',
      },
      include: {
        asset: {
          include: {
            category: true,
          },
        },
        user: true,
      },
    }),
    db.asset.update({
      where: { id: assignment.assetId },
      data: { 
        status: 'Available',
        condition: input.condition,
      },
    }),
  ])

  return updatedAssignment
}

export const deleteAssetAssignment = ({ id }, { context }) => {
  requireAuth({ roles: ['ADMIN'] }, context)
  return db.assetAssignment.delete({
    where: { id },
    include: {
      asset: true,
      user: true,
    },
  })
}

export const AssetAssignment = {
  asset: (_obj, { root }) => {
    return db.assetAssignment.findUnique({ where: { id: root?.id } }).asset()
  },
  user: (_obj, { root }) => {
    return db.assetAssignment.findUnique({ where: { id: root?.id } }).user()
  },
}
