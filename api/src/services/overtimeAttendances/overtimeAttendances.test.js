import {
  overtimeAttendances,
  overtimeAttendance,
  createOvertimeAttendance,
  updateOvertimeAttendance,
  deleteOvertimeAttendance,
} from './overtimeAttendances'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('overtimeAttendances', () => {
  scenario('returns all overtimeAttendances', async (scenario) => {
    const result = await overtimeAttendances()

    expect(result.length).toEqual(
      Object.keys(scenario.overtimeAttendance).length
    )
  })

  scenario('returns a single overtimeAttendance', async (scenario) => {
    const result = await overtimeAttendance({
      id: scenario.overtimeAttendance.one.id,
    })

    expect(result).toEqual(scenario.overtimeAttendance.one)
  })

  scenario('creates a overtimeAttendance', async (scenario) => {
    const result = await createOvertimeAttendance({
      input: {
        userId: scenario.overtimeAttendance.two.userId,
        date: '2025-06-13T20:52:00.103Z',
      },
    })

    expect(result.userId).toEqual(scenario.overtimeAttendance.two.userId)
    expect(result.date).toEqual(new Date('2025-06-13T20:52:00.103Z'))
  })

  scenario('updates a overtimeAttendance', async (scenario) => {
    const original = await overtimeAttendance({
      id: scenario.overtimeAttendance.one.id,
    })
    const result = await updateOvertimeAttendance({
      id: original.id,
      input: { date: '2025-06-14T20:52:00.130Z' },
    })

    expect(result.date).toEqual(new Date('2025-06-14T20:52:00.130Z'))
  })

  scenario('deletes a overtimeAttendance', async (scenario) => {
    const original = await deleteOvertimeAttendance({
      id: scenario.overtimeAttendance.one.id,
    })
    const result = await overtimeAttendance({ id: original.id })

    expect(result).toEqual(null)
  })
})
