import { db } from 'src/lib/db'

export const standard = defineScenario({
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
    two: {
      data: {
        name: 'A4 Paper',
        description: 'White A4 printing paper',
        categoryId: 'officeSupplyCategory.one.id',
        currentStock: 50,
        minimumStock: 10,
        reorderLevel: 15,
        unit: 'reams',
        costPerUnit: 8.99,
        supplier: 'Staples',
      },
    },
  },
})
