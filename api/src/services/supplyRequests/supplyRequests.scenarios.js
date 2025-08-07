import { db } from 'src/lib/db'

export const standard = defineScenario({
  user: {
    one: {
      data: {
        id: 'user-1',
        email: 'john@example.com',
        hashedPassword: 'hashed-password',
        salt: 'salt',
        name: 'John Doe',
        roles: ['USER'],
      },
    },
    admin: {
      data: {
        id: 'admin-1',
        email: 'admin@example.com',
        hashedPassword: 'hashed-password',
        salt: 'salt',
        name: 'Admin User',
        roles: ['ADMIN'],
      },
    },
  },
  officeSupplyCategory: {
    one: {
      data: {
        name: 'Office Supplies',
        description: 'General office supplies',
      },
    },
  },
  officeSupply: {
    one: {
      data: {
        name: 'Blue Pen',
        description: 'Blue ballpoint pen',
        categoryId: 'officeSupplyCategory.one.id',
        currentStock: 100,
        minimumStock: 20,
        reorderLevel: 25,
        unit: 'pieces',
        costPerUnit: 1.50,
        supplier: 'Office Depot',
      },
    },
  },
  supplyRequest: {
    one: {
      data: {
        userId: 'user.one.id',
        supplyId: 'officeSupply.one.id',
        quantityRequested: 10,
        justification: 'Need for daily work',
        urgency: 'LOW',
        status: 'APPROVED',
        approvedAt: new Date(),
      },
    },
    pending: {
      data: {
        userId: 'user.one.id',
        supplyId: 'officeSupply.one.id',
        quantityRequested: 5,
        justification: 'Urgent project requirement',
        urgency: 'HIGH',
        status: 'PENDING',
      },
    },
    rejected: {
      data: {
        userId: 'user.one.id',
        supplyId: 'officeSupply.one.id',
        quantityRequested: 50,
        justification: 'Large quantity request',
        urgency: 'LOW',
        status: 'REJECTED',
        approvedAt: new Date(),
        approverNotes: 'Excessive quantity requested',
      },
    },
  },
})
