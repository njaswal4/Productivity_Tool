import { db } from 'src/lib/db'
import { ForbiddenError, ValidationError, UserInputError } from '@redwoodjs/graphql-server'
import { requireAuth } from 'src/lib/auth'
import { context } from '@redwoodjs/graphql-server'

export const officeSupplies = () => {
  return db.officeSupply.findMany({
    include: {
      category: true,
    },
  })
}

export const officeSupply = ({ id }) => {
  return db.officeSupply.findUnique({
    where: { id },
    include: {
      category: true,
    },
  })
}

export const createOfficeSupply = ({ input }) => {
  requireAuth()
  
  // Check if user is admin
  const isAdmin = context.currentUser.roles?.includes('ADMIN')
  if (!isAdmin) {
    throw new ForbiddenError('Only administrators can create office supplies')
  }
  
  // Validate minimum stock and reorder level
  if (input.reorderLevel && input.minimumStock && input.reorderLevel < input.minimumStock) {
    throw new ValidationError('Reorder level cannot be less than minimum stock')
  }

  return db.officeSupply.create({
    data: {
      ...input,
      currentStock: input.currentStock || 0,
    },
  })
}

export const updateOfficeSupply = ({ id, input }) => {
  requireAuth()
  
  // Check if user is admin
  const isAdmin = context.currentUser.roles?.includes('ADMIN')
  if (!isAdmin) {
    throw new ForbiddenError('Only administrators can update office supplies')
  }
  
  // Validate minimum stock and reorder level
  if (input.reorderLevel && input.minimumStock && input.reorderLevel < input.minimumStock) {
    throw new ValidationError('Reorder level cannot be less than minimum stock')
  }

  return db.officeSupply.update({
    data: input,
    where: { id },
  })
}

export const deleteOfficeSupply = async ({ id }, { context }) => {
  requireAuth({}, context)
  
  // Check if user is admin
  const isAdmin = context.currentUser.roles?.includes('ADMIN')
  if (!isAdmin) {
    throw new ForbiddenError('Only administrators can delete office supplies')
  }
  
  // Check if there are any supply requests for this office supply
  const existingRequests = await db.supplyRequest.findMany({
    where: { supplyId: id }
  })
  
  if (existingRequests.length > 0) {
    throw new UserInputError(
      `Cannot delete this office supply because it has ${existingRequests.length} existing supply request(s). Please handle or delete the related requests first.`
    )
  }
  
  return db.officeSupply.delete({
    where: { id },
  })
}

// Bulk update stock levels
export const updateStockLevel = ({ id, quantity, operation }) => {
  requireAuth()
  
  // Check if user is admin
  const isAdmin = context.currentUser.roles?.includes('ADMIN')
  if (!isAdmin) {
    throw new ForbiddenError('Only administrators can update stock levels')
  }
  
  return db.$transaction(async (tx) => {
    const supply = await tx.officeSupply.findUnique({ where: { id } })
    
    if (!supply) {
      throw new ValidationError('Office supply not found')
    }

    let newStock
    switch (operation) {
      case 'ADD':
        newStock = supply.currentStock + quantity
        break
      case 'SUBTRACT':
        newStock = Math.max(0, supply.currentStock - quantity)
        break
      case 'SET':
        newStock = quantity
        break
      default:
        throw new ValidationError('Invalid stock operation')
    }

    return tx.officeSupply.update({
      where: { id },
      data: { 
        currentStock: newStock,
        lastUpdated: new Date(),
      },
    })
  })
}

// Get low stock supplies
export const lowStockSupplies = () => {
  return db.officeSupply.findMany({
    where: {
      OR: [
        { currentStock: { lte: db.officeSupply.fields.minimumStock } },
        { 
          AND: [
            { reorderLevel: { not: null } },
            { currentStock: { lte: db.officeSupply.fields.reorderLevel } }
          ]
        }
      ]
    },
    include: {
      category: true,
    },
  })
}

export const OfficeSupply = {
  category: (_obj, { root }) => {
    return db.officeSupply
      .findUnique({ where: { id: root?.id } })
      .category()
  },
  
  // Calculate if supply is low stock
  isLowStock: (obj) => {
    if (obj.reorderLevel) {
      return obj.currentStock <= obj.reorderLevel
    }
    return obj.currentStock <= obj.minimumStock
  },
  
  // Calculate stock status
  stockStatus: (obj) => {
    if (obj.currentStock === 0) return 'OUT_OF_STOCK'
    if (obj.reorderLevel && obj.currentStock <= obj.reorderLevel) return 'LOW_STOCK'
    if (obj.currentStock <= obj.minimumStock) return 'LOW_STOCK'
    return 'IN_STOCK'
  },
}
