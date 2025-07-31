import { db } from 'src/lib/db'

export const projectAllocations = () => {
  return db.projectAllocation.findMany({
    include: {
      project: true,
      user: true,
      allocatedByUser: true,
    },
    orderBy: { allocatedDate: 'desc' },
  })
}

export const projectAllocation = ({ id }) => {
  return db.projectAllocation.findUnique({
    where: { id },
    include: {
      project: {
        include: {
          manager: true,
        },
      },
      user: true,
      allocatedByUser: true,
      dailyUpdates: {
        orderBy: { updateDate: 'desc' },
      },
    },
  })
}

export const activeProjectAllocations = () => {
  return db.projectAllocation.findMany({
    where: { isActive: true },
    include: {
      project: {
        include: {
          manager: true,
        },
      },
      user: true,
      allocatedByUser: true,
    },
    orderBy: { allocatedDate: 'desc' },
  })
}

export const allocationsByProject = ({ projectId }) => {
  return db.projectAllocation.findMany({
    where: { projectId },
    include: {
      user: true,
      allocatedByUser: true,
      dailyUpdates: {
        orderBy: { updateDate: 'desc' },
        take: 5, // Last 5 updates
      },
    },
    orderBy: { allocatedDate: 'desc' },
  })
}

export const allocationsByUser = ({ userId }) => {
  return db.projectAllocation.findMany({
    where: { userId },
    include: {
      project: {
        include: {
          manager: true,
        },
      },
      allocatedByUser: true,
      dailyUpdates: {
        orderBy: { updateDate: 'desc' },
        take: 5,
      },
    },
    orderBy: { allocatedDate: 'desc' },
  })
}

export const dailyAllocations = ({ userId, date }) => {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  return db.projectAllocation.findMany({
    where: {
      userId,
      isActive: true,
      allocatedDate: {
        lte: endOfDay,
      },
      project: {
        status: {
          in: ['Active', 'In Progress'],
        },
      },
    },
    include: {
      project: {
        include: {
          manager: true,
          meetings: {
            where: {
              meetingDate: {
                gte: startOfDay,
                lte: endOfDay,
              },
              status: {
                in: ['Scheduled', 'In Progress'],
              },
            },
          },
        },
      },
      dailyUpdates: {
        where: {
          updateDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      },
    },
    orderBy: { project: { name: 'asc' } },
  })
}

export const createProjectAllocation = ({ input }, { context }) => {
  return db.projectAllocation.create({
    data: {
      ...input,
      allocatedDate: input.allocatedDate || new Date(),
    },
    include: {
      project: true,
      user: true,
      allocatedByUser: true,
    },
  })
}

export const updateProjectAllocation = ({ id, input }, { context }) => {
  return db.projectAllocation.update({
    data: input,
    where: { id },
    include: {
      project: true,
      user: true,
      allocatedByUser: true,
    },
  })
}

export const deleteProjectAllocation = ({ id }, { context }) => {
  return db.projectAllocation.delete({
    where: { id },
  })
}

export const deactivateProjectAllocation = ({ id }, { context }) => {
  return db.projectAllocation.update({
    data: { isActive: false },
    where: { id },
    include: {
      project: true,
      user: true,
      allocatedByUser: true,
    },
  })
}

export const ProjectAllocation = {
  project: (_obj, { root }) => {
    return db.projectAllocation.findUnique({ where: { id: root?.id } }).project()
  },
  user: (_obj, { root }) => {
    return db.projectAllocation.findUnique({ where: { id: root?.id } }).user()
  },
  allocatedByUser: (_obj, { root }) => {
    return db.projectAllocation.findUnique({ where: { id: root?.id } }).allocatedByUser()
  },
  dailyUpdates: (_obj, { root }) => {
    return db.projectAllocation.findUnique({ where: { id: root?.id } }).dailyUpdates()
  },
}
