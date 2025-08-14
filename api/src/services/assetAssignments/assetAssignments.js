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

export const myAssetAssignments = (args, { context }) => {
  requireAuth({}, context)
  return db.assetAssignment.findMany({
    where: {
      userId: parseInt(context.currentUser.id),
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

export const myAssetAssignmentReport = async ({ startDate, endDate }, { context }) => {
  requireAuth({}, context)
  const userId = parseInt(context.currentUser.id)

  // Set default date range if not provided (last 6 months)
  const endDateTime = endDate ? new Date(endDate) : new Date()
  const startDateTime = startDate ? new Date(startDate) : new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)

  // Get all assignments for the user within date range
  const assignments = await db.assetAssignment.findMany({
    where: {
      userId: userId,
      issueDate: {
        gte: startDateTime,
        lte: endDateTime,
      },
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

  // Calculate statistics
  const totalAssignments = assignments.length
  const activeAssignments = assignments.filter(a => a.status === 'Active').length
  const returnedAssignments = assignments.filter(a => a.status === 'Returned').length
  const overdueAssignments = assignments.filter(a => 
    a.status === 'Active' && 
    a.expectedReturnDate && 
    new Date(a.expectedReturnDate) < new Date()
  ).length

  // Group by asset category
  const categoryStats = {}
  assignments.forEach(assignment => {
    const categoryName = assignment.asset.category.name
    if (!categoryStats[categoryName]) {
      categoryStats[categoryName] = {
        categoryName,
        count: 0,
        activeCount: 0,
        returnedCount: 0,
      }
    }
    categoryStats[categoryName].count++
    if (assignment.status === 'Active') {
      categoryStats[categoryName].activeCount++
    } else if (assignment.status === 'Returned') {
      categoryStats[categoryName].returnedCount++
    }
  })

  // Group by month for monthly stats
  const monthlyStats = {}
  assignments.forEach(assignment => {
    const date = new Date(assignment.issueDate)
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`
    const monthName = date.toLocaleDateString('en-US', { month: 'long' })
    const year = date.getFullYear()

    if (!monthlyStats[monthKey]) {
      monthlyStats[monthKey] = {
        month: monthName,
        year: year,
        assignedCount: 0,
        returnedCount: 0,
      }
    }
    monthlyStats[monthKey].assignedCount++
    if (assignment.returnDate && new Date(assignment.returnDate) >= startDateTime && new Date(assignment.returnDate) <= endDateTime) {
      monthlyStats[monthKey].returnedCount++
    }
  })

  return {
    totalAssignments,
    activeAssignments,
    returnedAssignments,
    overdueAssignments,
    assignments,
    assetsByCategory: Object.values(categoryStats),
    monthlyStats: Object.values(monthlyStats).sort((a, b) => {
      const dateA = new Date(a.year, new Date(Date.parse(a.month +" 1, 2012")).getMonth())
      const dateB = new Date(b.year, new Date(Date.parse(b.month +" 1, 2012")).getMonth())
      return dateA - dateB
    }),
  }
}

export const allUsersAssetReport = async ({ startDate, endDate }, { context }) => {
  requireAuth({ roles: ['ADMIN'] }, context)

  // Set default date range if not provided (last 6 months)
  const endDateTime = endDate ? new Date(endDate) : new Date()
  const startDateTime = startDate ? new Date(startDate) : new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)

  // Get all assignments for all users within date range
  const assignments = await db.assetAssignment.findMany({
    where: {
      issueDate: {
        gte: startDateTime,
        lte: endDateTime,
      },
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

  // Calculate statistics
  const totalAssignments = assignments.length
  const activeAssignments = assignments.filter(a => a.status === 'Active').length
  const returnedAssignments = assignments.filter(a => a.status === 'Returned').length
  const overdueAssignments = assignments.filter(a => 
    a.status === 'Active' && 
    a.expectedReturnDate && 
    new Date(a.expectedReturnDate) < new Date()
  ).length

  // Group by asset category
  const categoryStats = {}
  assignments.forEach(assignment => {
    const categoryName = assignment.asset.category.name
    if (!categoryStats[categoryName]) {
      categoryStats[categoryName] = {
        categoryName,
        count: 0,
        activeCount: 0,
        returnedCount: 0,
      }
    }
    categoryStats[categoryName].count++
    if (assignment.status === 'Active') {
      categoryStats[categoryName].activeCount++
    } else if (assignment.status === 'Returned') {
      categoryStats[categoryName].returnedCount++
    }
  })

  // Group by month for monthly stats
  const monthlyStats = {}
  assignments.forEach(assignment => {
    const date = new Date(assignment.issueDate)
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`
    const monthName = date.toLocaleDateString('en-US', { month: 'long' })
    const year = date.getFullYear()

    if (!monthlyStats[monthKey]) {
      monthlyStats[monthKey] = {
        month: monthName,
        year: year,
        assignedCount: 0,
        returnedCount: 0,
      }
    }
    monthlyStats[monthKey].assignedCount++
    if (assignment.returnDate && new Date(assignment.returnDate) >= startDateTime && new Date(assignment.returnDate) <= endDateTime) {
      monthlyStats[monthKey].returnedCount++
    }
  })

  return {
    totalAssignments,
    activeAssignments,
    returnedAssignments,
    overdueAssignments,
    assignments,
    assetsByCategory: Object.values(categoryStats),
    monthlyStats: Object.values(monthlyStats).sort((a, b) => {
      const dateA = new Date(a.year, new Date(Date.parse(a.month +" 1, 2012")).getMonth())
      const dateB = new Date(b.year, new Date(Date.parse(b.month +" 1, 2012")).getMonth())
      return dateA - dateB
    }),
  }
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
  requireAuth({}, context)
  
  const assignment = await db.assetAssignment.findUnique({
    where: { id: assignmentId },
    include: {
      asset: true,
      user: true,
    },
  })

  if (!assignment) {
    throw new Error('Assignment not found')
  }

  // Check if user is admin or owns the assignment
  const isAdmin = context.currentUser?.roles?.includes('ADMIN')
  const isOwner = assignment.userId === parseInt(context.currentUser?.id)
  
  if (!isAdmin && !isOwner) {
    throw new Error('You can only return your own assets')
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
