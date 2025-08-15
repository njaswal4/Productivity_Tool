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

  // Validate required fields
  if (!input.categoryId) {
    throw new ValidationError('Category ID is required')
  }
  
  if (!input.name || input.name.trim() === '') {
    throw new ValidationError('Name is required')
  }
  
  if (input.stockCount === null || input.stockCount === undefined) {
    throw new ValidationError('Stock count is required')
  }
  
  if (input.unitPrice === null || input.unitPrice === undefined) {
    throw new ValidationError('Unit price is required')
  }

  // Clean the input to remove any unwanted fields
  const cleanInput = {
    name: input.name,
    description: input.description || null,
    stockCount: input.stockCount,
    unitPrice: input.unitPrice,
    categoryId: input.categoryId,
  }

  return db.officeSupply.create({
    data: cleanInput,
  })
}

export const updateOfficeSupply = ({ id, input }) => {
  requireAuth()
  
  // Check if user is admin
  const isAdmin = context.currentUser.roles?.includes('ADMIN')
  if (!isAdmin) {
    throw new ForbiddenError('Only administrators can update office supplies')
  }

  // Clean the input to remove any unwanted fields
  const cleanInput = {}
  if (input.name !== undefined) cleanInput.name = input.name
  if (input.description !== undefined) cleanInput.description = input.description
  if (input.stockCount !== undefined) cleanInput.stockCount = input.stockCount
  if (input.unitPrice !== undefined) cleanInput.unitPrice = input.unitPrice
  if (input.categoryId !== undefined) cleanInput.categoryId = input.categoryId

  return db.officeSupply.update({
    data: cleanInput,
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
        newStock = supply.stockCount + quantity
        break
      case 'SUBTRACT':
        newStock = Math.max(0, supply.stockCount - quantity)
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
        stockCount: newStock,
      },
    })
  })
}

// Get low stock supplies (supplies with stock count <= 10)
export const lowStockSupplies = () => {
  return db.officeSupply.findMany({
    where: {
      stockCount: { lte: 10 }
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
  
  // Calculate if supply is low stock (stockCount <= 10)
  isLowStock: (obj) => {
    return obj.stockCount <= 10
  },
  
  // Calculate stock status
  stockStatus: (obj) => {
    if (obj.stockCount === 0) return 'OUT_OF_STOCK'
    if (obj.stockCount <= 10) return 'LOW_STOCK'
    return 'IN_STOCK'
  },
}
