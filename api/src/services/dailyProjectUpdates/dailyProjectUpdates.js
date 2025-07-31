import { db } from 'src/lib/db'

export const dailyProjectUpdates = ({ startDate, endDate }) => {
  const where = {}
  
  if (startDate || endDate) {
    where.date = {}
    if (startDate) {
      where.date.gte = startDate
    }
    if (endDate) {
      where.date.lte = endDate
    }
  }

  return db.dailyProjectUpdate.findMany({
    where,
    include: {
      allocation: {
        include: {
          project: true,
          user: true,
        },
      },
      project: true,
    },
    orderBy: { date: 'desc' },
  })
}

export const dailyProjectUpdate = ({ id }) => {
  return db.dailyProjectUpdate.findUnique({
    where: { id },
    include: {
      allocation: {
        include: {
          project: {
            include: {
              manager: true,
            },
          },
          user: true,
          allocatedByUser: true,
        },
      },
      project: {
        include: {
          manager: true,
        },
      },
    },
  })
}

export const updatesByAllocation = ({ allocationId }) => {
  return db.dailyProjectUpdate.findMany({
    where: { allocationId },
    include: {
      allocation: {
        include: {
          project: true,
          user: true,
        },
      },
    },
    orderBy: { date: 'desc' },
  })
}

export const updatesByProject = ({ projectId }) => {
  return db.dailyProjectUpdate.findMany({
    where: { projectId },
    include: {
      allocation: {
        include: {
          user: true,
        },
      },
      project: true,
    },
    orderBy: { date: 'desc' },
  })
}

export const updatesByUser = ({ userId }) => {
  return db.dailyProjectUpdate.findMany({
    where: {
      allocation: {
        userId,
      },
    },
    include: {
      allocation: {
        include: {
          project: {
            include: {
              manager: true,
            },
          },
        },
      },
      project: true,
    },
    orderBy: { date: 'desc' },
  })
}

export const updatesByDate = ({ date }) => {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  return db.dailyProjectUpdate.findMany({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      allocation: {
        include: {
          project: true,
          user: true,
        },
      },
      project: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export const userUpdatesForDate = ({ userId, date }) => {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  return db.dailyProjectUpdate.findMany({
    where: {
      allocation: {
        userId,
      },
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      allocation: {
        include: {
          project: {
            include: {
              manager: true,
            },
          },
        },
      },
      project: true,
    },
    orderBy: { project: { name: 'asc' } },
  })
}

export const projectUpdatesForDate = ({ projectId, date }) => {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  return db.dailyProjectUpdate.findMany({
    where: {
      projectId,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      allocation: {
        include: {
          user: true,
        },
      },
      project: true,
    },
    orderBy: { allocation: { user: { name: 'asc' } } },
  })
}

export const createDailyProjectUpdate = ({ input }, { context }) => {
  return db.dailyProjectUpdate.create({
    data: {
      ...input,
      date: input.date || new Date(),
      meetingsAttended: input.meetingsAttended || [],
    },
    include: {
      allocation: {
        include: {
          project: true,
          user: true,
        },
      },
      project: true,
    },
  })
}

export const updateDailyProjectUpdate = ({ id, input }, { context }) => {
  return db.dailyProjectUpdate.update({
    data: input,
    where: { id },
    include: {
      allocation: {
        include: {
          project: true,
          user: true,
        },
      },
      project: true,
    },
  })
}

export const deleteDailyProjectUpdate = ({ id }, { context }) => {
  return db.dailyProjectUpdate.delete({
    where: { id },
  })
}

export const DailyProjectUpdate = {
  allocation: (_obj, { root }) => {
    return db.dailyProjectUpdate.findUnique({ where: { id: root?.id } }).allocation()
  },
  project: (_obj, { root }) => {
    return db.dailyProjectUpdate.findUnique({ where: { id: root?.id } }).project()
  },
  user: (_obj, { root }) => {
    return db.dailyProjectUpdate.findUnique({ 
      where: { id: root?.id },
      include: { allocation: { include: { user: true } } }
    }).then(update => update.allocation.user)
  },
}
