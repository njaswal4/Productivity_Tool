import { db } from 'src/lib/db'
import { requireAuth } from 'src/lib/auth'
import { ForbiddenError } from '@redwoodjs/graphql-server'
import { context } from '@redwoodjs/graphql-server'

export const officeSupplyCategories = () => {
  return db.officeSupplyCategory.findMany()
}

export const officeSupplyCategory = ({ id }) => {
  return db.officeSupplyCategory.findUnique({
    where: { id },
  })
}

export const createOfficeSupplyCategory = ({ input }) => {
  requireAuth()
  
  // Check if user is admin
  const isAdmin = context.currentUser.roles?.includes('ADMIN')
  if (!isAdmin) {
    throw new ForbiddenError('Only administrators can create office supply categories')
  }
  
  return db.officeSupplyCategory.create({
    data: input,
  })
}

export const updateOfficeSupplyCategory = ({ id, input }) => {
  requireAuth()
  
  // Check if user is admin
  const isAdmin = context.currentUser.roles?.includes('ADMIN')
  if (!isAdmin) {
    throw new ForbiddenError('Only administrators can update office supply categories')
  }
  
  return db.officeSupplyCategory.update({
    data: input,
    where: { id },
  })
}

export const deleteOfficeSupplyCategory = ({ id }) => {
  requireAuth()
  
  // Check if user is admin
  const isAdmin = context.currentUser.roles?.includes('ADMIN')
  if (!isAdmin) {
    throw new ForbiddenError('Only administrators can delete office supply categories')
  }
  
  return db.officeSupplyCategory.delete({
    where: { id },
  })
}

export const OfficeSupplyCategory = {
  supplies: (_obj, { root }) => {
    return db.officeSupplyCategory
      .findUnique({ where: { id: root?.id } })
      .supplies()
  },
}
