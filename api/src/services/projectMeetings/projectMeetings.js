import { db } from 'src/lib/db'

export const projectMeetings = () => {
  return db.projectMeeting.findMany({
    include: {
      project: true,
      organizer: true,
    },
    orderBy: { meetingDate: 'desc' },
  })
}

export const projectMeeting = ({ id }) => {
  return db.projectMeeting.findUnique({
    where: { id },
    include: {
      project: {
        include: {
          manager: true,
          allocations: {
            include: {
              user: true,
            },
          },
        },
      },
      organizer: true,
    },
  })
}

export const meetingsByProject = ({ projectId }) => {
  return db.projectMeeting.findMany({
    where: { projectId },
    include: {
      project: true,
      organizer: true,
    },
    orderBy: { meetingDate: 'asc' },
  })
}

export const upcomingMeetings = ({ userId }) => {
  const now = new Date()
  
  return db.projectMeeting.findMany({
    where: {
      meetingDate: {
        gte: now,
      },
      status: {
        in: ['Scheduled'],
      },
      OR: [
        {
          project: {
            allocations: {
              some: {
                userId,
                isActive: true,
              },
            },
          },
        },
        {
          organizerId: userId,
        },
      ],
    },
    include: {
      project: {
        include: {
          manager: true,
        },
      },
      organizer: true,
    },
    orderBy: { meetingDate: 'asc' },
  })
}

export const todaysMeetings = ({ userId }) => {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)

  return db.projectMeeting.findMany({
    where: {
      meetingDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        in: ['Scheduled', 'In Progress'],
      },
      OR: [
        {
          project: {
            allocations: {
              some: {
                userId,
                isActive: true,
              },
            },
          },
        },
        {
          organizerId: userId,
        },
      ],
    },
    include: {
      project: {
        include: {
          manager: true,
        },
      },
      organizer: true,
    },
    orderBy: { meetingDate: 'asc' },
  })
}

export const meetingsByDateRange = ({ startDate, endDate }) => {
  return db.projectMeeting.findMany({
    where: {
      meetingDate: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
    include: {
      project: true,
      organizer: true,
    },
    orderBy: { meetingDate: 'asc' },
  })
}

export const createProjectMeeting = ({ input }, { context }) => {
  return db.projectMeeting.create({
    data: {
      ...input,
      attendeeIds: input.attendeeIds || [],
    },
    include: {
      project: true,
      organizer: true,
    },
  })
}

export const updateProjectMeeting = ({ id, input }, { context }) => {
  return db.projectMeeting.update({
    data: input,
    where: { id },
    include: {
      project: true,
      organizer: true,
    },
  })
}

export const deleteProjectMeeting = ({ id }, { context }) => {
  return db.projectMeeting.delete({
    where: { id },
  })
}

export const markMeetingCompleted = ({ id }, { context }) => {
  return db.projectMeeting.update({
    data: { status: 'Completed' },
    where: { id },
    include: {
      project: true,
      organizer: true,
    },
  })
}

export const cancelMeeting = ({ id }, { context }) => {
  return db.projectMeeting.update({
    data: { status: 'Cancelled' },
    where: { id },
    include: {
      project: true,
      organizer: true,
    },
  })
}

export const ProjectMeeting = {
  project: (_obj, { root }) => {
    return db.projectMeeting.findUnique({ where: { id: root?.id } }).project()
  },
  organizer: (_obj, { root }) => {
    return db.projectMeeting.findUnique({ where: { id: root?.id } }).organizer()
  },
}
