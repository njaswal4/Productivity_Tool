import { db } from 'src/lib/db'

export const standard = defineScenario({
  officeSupplyCategory: {
    one: {
      data: {
        name: 'Office Furniture',
        description: 'Desks, chairs, and office furniture items',
      },
    },
    two: {
      data: {
        name: 'Stationery',
        description: 'Pens, paper, and writing materials',
      },
    },
  },
})
