import {
  attendances,
  attendance,
  createAttendance,
  updateAttendance,
  deleteAttendance,
} from './attendances'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('attendances', () => {
  scenario('returns all attendances', async (scenario) => {
    const result = await attendances()

    expect(result.length).toEqual(Object.keys(scenario.attendance).length)
  })

  scenario('returns a single attendance', async (scenario) => {
    const result = await attendance({ id: scenario.attendance.one.id })

    expect(result).toEqual(scenario.attendance.one)
  })

  scenario('creates a attendance', async (scenario) => {
    const result = await createAttendance({
      input: {
        userId: scenario.attendance.two.userId,
        date: '2025-06-05T17:18:48.689Z',
        status: 'String',
      },
    })

    expect(result.userId).toEqual(scenario.attendance.two.userId)
    expect(result.date).toEqual(new Date('2025-06-05T17:18:48.689Z'))
    expect(result.status).toEqual('String')
  })

  scenario('updates a attendance', async (scenario) => {
    const original = await attendance({
      id: scenario.attendance.one.id,
    })
    const result = await updateAttendance({
      id: original.id,
      input: { date: '2025-06-06T17:18:48.698Z' },
    })

    expect(result.date).toEqual(new Date('2025-06-06T17:18:48.698Z'))
  })

  scenario('deletes a attendance', async (scenario) => {
    const original = await deleteAttendance({
      id: scenario.attendance.one.id,
    })
    const result = await attendance({ id: original.id })

    expect(result).toEqual(null)
  })
})
