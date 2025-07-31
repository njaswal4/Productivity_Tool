import { db } from 'src/lib/db'

export const projects = () => {
  return db.project.findMany({
    include: {
      manager: true,
      allocations: {
        include: {
          user: true,
        },
      },
      _count: {
        select: {
          allocations: true,
          meetings: true,
          dailyUpdates: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export const project = ({ id }) => {
  return db.project.findUnique({
    where: { id },
    include: {
      manager: true,
      allocations: {
        include: {
          user: true,
          allocatedByUser: true,
        },
      },
      meetings: {
        include: {
          organizer: true,
        },
        orderBy: { meetingDate: 'asc' },
      },
      dailyUpdates: {
        include: {
          allocation: {
            include: {
              user: true,
            },
          },
        },
        orderBy: { updateDate: 'desc' },
      },
    },
  })
}

export const activeProjects = () => {
  return db.project.findMany({
    where: {
      status: {
        in: ['ACTIVE', 'ON_HOLD'],
      },
    },
    include: {
      manager: true,
      allocations: {
        where: { isActive: true },
        include: {
          user: true,
        },
      },
    },
    orderBy: { startDate: 'asc' },
  })
}

export const projectsByManager = ({ managerId }) => {
  return db.project.findMany({
    where: { managerId },
    include: {
      manager: true,
      allocations: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export const projectsWithUserAllocations = ({ userId }) => {
  return db.project.findMany({
    where: {
      allocations: {
        some: {
          userId,
          isActive: true,
        },
      },
    },
    include: {
      manager: true,
      allocations: {
        where: { userId },
        include: {
          user: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  })
}

export const createProject = ({ input }, { context }) => {
  return db.project.create({
    data: input,
    include: {
      manager: true,
      allocations: true,
    },
  })
}

export const updateProject = ({ id, input }, { context }) => {
  return db.project.update({
    data: input,
    where: { id },
    include: {
      manager: true,
      allocations: true,
    },
  })
}

export const deleteProject = ({ id }, { context }) => {
  return db.project.delete({
    where: { id },
  })
}

export const Project = {
  manager: (_obj, { root }) => {
    return db.project.findUnique({ where: { id: root?.id } }).manager()
  },
  allocations: (_obj, { root }) => {
    return db.project.findUnique({ where: { id: root?.id } }).allocations()
  },
  meetings: (_obj, { root }) => {
    return db.project.findUnique({ where: { id: root?.id } }).meetings()
  },
  dailyUpdates: (_obj, { root }) => {
    return db.project.findUnique({ where: { id: root?.id } }).dailyUpdates()
  },
}
