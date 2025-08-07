import { officeSupplyCategories, officeSupplyCategory, createOfficeSupplyCategory, updateOfficeSupplyCategory, deleteOfficeSupplyCategory } from './officeSupplyCategories'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments:
//   1. Anything that involves unique constraints
//   2. Anything that involves relationships to other models
// Don't forget to import any models you are testing against

describe('officeSupplyCategories', () => {
  scenario('returns all officeSupplyCategories', async (scenario) => {
    const result = await officeSupplyCategories()

    expect(result.length).toEqual(Object.keys(scenario.officeSupplyCategory).length)
  })

  scenario('returns a single officeSupplyCategory', async (scenario) => {
    const result = await officeSupplyCategory({ id: scenario.officeSupplyCategory.one.id })

    expect(result).toEqual(scenario.officeSupplyCategory.one)
  })

  scenario('creates a officeSupplyCategory', async () => {
    const result = await createOfficeSupplyCategory({
      input: { name: 'Test Category', description: 'Test Description' },
    })

    expect(result.name).toEqual('Test Category')
    expect(result.description).toEqual('Test Description')
  })

  scenario('updates a officeSupplyCategory', async (scenario) => {
    const original = await officeSupplyCategory({ id: scenario.officeSupplyCategory.one.id })
    const result = await updateOfficeSupplyCategory({
      id: original.id,
      input: { name: 'Updated Category' },
    })

    expect(result.name).toEqual('Updated Category')
  })

  scenario('deletes a officeSupplyCategory', async (scenario) => {
    const original = await deleteOfficeSupplyCategory({ id: scenario.officeSupplyCategory.one.id })
    const result = await officeSupplyCategory({ id: original.id })

    expect(result).toEqual(null)
  })
})
