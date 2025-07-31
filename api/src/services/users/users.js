import { db } from 'src/lib/db'
import { logger } from 'src/lib/logger'
import { context } from '@redwoodjs/graphql-server'

export const users = () => {
  return db.user.findMany({
    include: {
      bookings: true,
      selectedMeetingRoom: true,
      exceptionRequests: true,
      attendances: true,
      projectAllocations: {
        include: {
          project: true,
        },
      },
      reportingManagerUser: true,
      // Include related users who report to this user
      directReports: true,
    },
    orderBy: { name: 'asc' },
  })
}

export const user = ({ id }) => {
  return db.user.findUnique({
    where: { id },
    include: {
      bookings: true,
      selectedMeetingRoom: true,
      exceptionRequests: true,
      attendances: true,
      projectAllocations: {
        include: {
          project: true,
        },
      },
      reportingManagerUser: true,
      directReports: true,
    },
  })
}

export const userByEmail = ({ email }) => {
  return db.user.findUnique({
    where: { email },
    include: {
      bookings: true,
      selectedMeetingRoom: true,
      exceptionRequests: true,
      attendances: true,
    },
  })
}

export const userByMicrosoftId = ({ microsoftId }) => {
  return db.user.findUnique({
    where: { microsoftId },
    include: {
      bookings: true,
      selectedMeetingRoom: true,
      exceptionRequests: true,
      attendances: true,
    },
  })
}

export const createUser = ({ input }) => {
  logger.info('Creating user:', input)
  return db.user.create({
    data: {
      ...input,
      roles: input.roles || ['USER'],
    },
    include: {
      bookings: true,
      selectedMeetingRoom: true,
      exceptionRequests: true,
      attendances: true,
    },
  })
}

export const updateUser = ({ id, input }) => {
  logger.info('Updating user:', { id, input })
  return db.user.update({
    data: input,
    where: { id },
    include: {
      bookings: true,
      selectedMeetingRoom: true,
      exceptionRequests: true,
      attendances: true,
    },
  })
}

export const deleteUser = ({ id }) => {
  logger.info('Deleting user:', id)
  return db.user.delete({
    where: { id },
  })
}

export const upsertUser = ({ input }) => {
  console.log('Upserting user with email:', input.email)
  
  return db.user.upsert({
    where: { email: input.email },
    update: {
      name: input.name,
      microsoftId: input.microsoftId,
      roles: input.roles || ['USER'],
    },
    create: {
      email: input.email,
      name: input.name || input.email,
      microsoftId: input.microsoftId,
      roles: input.roles || ['USER'],
    },
  })
}

export const updateUserRoles = ({ id, roles }) => {
  logger.info('Updating user roles:', { id, roles })
  return db.user.update({
    where: { id },
    data: { roles },
    include: {
      bookings: true,
      selectedMeetingRoom: true,
      exceptionRequests: true,
      attendances: true,
    },
  })
}

export const currentUser = () => {
  const currentUser = context.currentUser
  if (!currentUser?.email) return null

  return db.user.findUnique({
    where: { email: currentUser.email },
    include: {
      bookings: true,
      selectedMeetingRoom: true,
      exceptionRequests: true,
      attendances: true,
      projectAllocations: {
        include: {
          project: true,
        },
      },
      reportingManagerUser: true,
      directReports: true,
      managedProjects: true,
      assetAssignments: true,
      vacationRequests: true,
    },
  })
}

export const User = {
  bookings: (_obj, { root }) => {
    return db.user.findUnique({ where: { id: root?.id } }).bookings()
  },
  selectedMeetingRoom: (_obj, { root }) => {
    return db.user.findUnique({ where: { id: root?.id } }).selectedMeetingRoom()
  },
  exceptionRequests: (_obj, { root }) => {
    return db.user.findUnique({ where: { id: root?.id } }).exceptionRequests()
  },
  attendances: (_obj, { root }) => {
    return db.user.findUnique({ where: { id: root?.id } }).attendances()
  },
  assetAssignments: (_obj, { root }) => {
    return db.user.findUnique({ where: { id: root?.id } }).assetAssignments()
  },
  vacationRequests: (_obj, { root }) => {
    return db.user.findUnique({ where: { id: root?.id } }).vacationRequests()
  },
  attendancesInRange: (user, { start, end }) => {
    if (!user?.id || !start || !end) return []
    return db.attendance.findMany({
      where: {
        userId: user.id,
        date: {
          gte: new Date(start),
          lte: new Date(end),
        },
      },
    })
  },
  
  // Employee Management Resolvers
  reportingManagerUser: (_obj, { root }) => {
    return db.user.findUnique({ where: { id: root?.id } }).reportingManagerUser()
  },
  directReports: (_obj, { root }) => {
    return db.user.findUnique({ where: { id: root?.id } }).directReports()
  },
  
  // Project Allocation Resolvers
  projectAllocations: (_obj, { root }) => {
    return db.user.findUnique({ where: { id: root?.id } }).projectAllocations({
      include: {
        project: true,
      },
    })
  },
  managedProjects: (_obj, { root }) => {
    return db.user.findUnique({ where: { id: root?.id } }).managedProjects()
  },
}

