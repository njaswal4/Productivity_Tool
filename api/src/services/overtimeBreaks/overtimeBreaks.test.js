import {
  overtimeBreaks,
  overtimeBreak,
  createOvertimeBreak,
  updateOvertimeBreak,
  deleteOvertimeBreak,
} from './overtimeBreaks'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('overtimeBreaks', () => {
  scenario('returns all overtimeBreaks', async (scenario) => {
    const result = await overtimeBreaks()

    expect(result.length).toEqual(Object.keys(scenario.overtimeBreak).length)
  })

  scenario('returns a single overtimeBreak', async (scenario) => {
    const result = await overtimeBreak({ id: scenario.overtimeBreak.one.id })

    expect(result).toEqual(scenario.overtimeBreak.one)
  })

  scenario('creates a overtimeBreak', async (scenario) => {
    const result = await createOvertimeBreak({
      input: {
        overtimeId: scenario.overtimeBreak.two.overtimeId,
        breakIn: '2025-06-13T20:52:29.073Z',
      },
    })

    expect(result.overtimeId).toEqual(scenario.overtimeBreak.two.overtimeId)
    expect(result.breakIn).toEqual(new Date('2025-06-13T20:52:29.073Z'))
  })

  scenario('updates a overtimeBreak', async (scenario) => {
    const original = await overtimeBreak({
      id: scenario.overtimeBreak.one.id,
    })
    const result = await updateOvertimeBreak({
      id: original.id,
      input: { breakIn: '2025-06-14T20:52:29.102Z' },
    })

    expect(result.breakIn).toEqual(new Date('2025-06-14T20:52:29.102Z'))
  })

  scenario('deletes a overtimeBreak', async (scenario) => {
    const original = await deleteOvertimeBreak({
      id: scenario.overtimeBreak.one.id,
    })
    const result = await overtimeBreak({ id: original.id })

    expect(result).toEqual(null)
  })
})
