import { officeSupplies, officeSupply, createOfficeSupply, updateOfficeSupply, deleteOfficeSupply, updateStockLevel, lowStockSupplies } from './officeSupplies'

describe('officeSupplies', () => {
  scenario('returns all officeSupplies', async (scenario) => {
    const result = await officeSupplies()
    expect(result.length).toEqual(Object.keys(scenario.officeSupply).length)
  })

  scenario('returns a single officeSupply', async (scenario) => {
    const result = await officeSupply({ id: scenario.officeSupply.one.id })
    expect(result).toEqual(scenario.officeSupply.one)
  })

  scenario('creates a officeSupply', async (scenario) => {
    const result = await createOfficeSupply({
      input: { 
        name: 'Test Supply',
        description: 'Test Description',
        categoryId: scenario.officeSupplyCategory.one.id,
        currentStock: 100,
        minimumStock: 10,
        unit: 'pieces',
        costPerUnit: 5.99
      },
    })

    expect(result.name).toEqual('Test Supply')
    expect(result.currentStock).toEqual(100)
    expect(result.minimumStock).toEqual(10)
  })

  scenario('updates a officeSupply', async (scenario) => {
    const original = await officeSupply({ id: scenario.officeSupply.one.id })
    const result = await updateOfficeSupply({
      id: original.id,
      input: { currentStock: 50 },
    })

    expect(result.currentStock).toEqual(50)
  })

  scenario('deletes a officeSupply', async (scenario) => {
    const original = await deleteOfficeSupply({ id: scenario.officeSupply.one.id })
    const result = await officeSupply({ id: original.id })

    expect(result).toEqual(null)
  })

  scenario('updates stock level with ADD operation', async (scenario) => {
    const result = await updateStockLevel({
      id: scenario.officeSupply.one.id,
      quantity: 20,
      operation: 'ADD'
    })

    expect(result.currentStock).toEqual(120) // original 100 + 20
  })

  scenario('updates stock level with SUBTRACT operation', async (scenario) => {
    const result = await updateStockLevel({
      id: scenario.officeSupply.one.id,
      quantity: 30,
      operation: 'SUBTRACT'
    })

    expect(result.currentStock).toEqual(70) // original 100 - 30
  })

  scenario('returns low stock supplies', async (scenario) => {
    // Create a low stock supply
    await createOfficeSupply({
      input: {
        name: 'Low Stock Item',
        categoryId: scenario.officeSupplyCategory.one.id,
        currentStock: 5,
        minimumStock: 10,
        unit: 'pieces'
      }
    })

    const result = await lowStockSupplies()
    expect(result.length).toBeGreaterThan(0)
  })
})
