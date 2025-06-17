import {
  officeHourses,
  officeHours,
  createOfficeHours,
  updateOfficeHours,
  deleteOfficeHours,
} from './officeHourses'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('officeHourses', () => {
  scenario('returns all officeHourses', async (scenario) => {
    const result = await officeHourses()

    expect(result.length).toEqual(Object.keys(scenario.officeHours).length)
  })

  scenario('returns a single officeHours', async (scenario) => {
    const result = await officeHours({ id: scenario.officeHours.one.id })

    expect(result).toEqual(scenario.officeHours.one)
  })

  scenario('creates a officeHours', async () => {
    const result = await createOfficeHours({
      input: {
        startTime: 'String',
        endTime: 'String',
        updatedAt: '2025-06-13T21:16:59.371Z',
      },
    })

    expect(result.startTime).toEqual('String')
    expect(result.endTime).toEqual('String')
    expect(result.updatedAt).toEqual(new Date('2025-06-13T21:16:59.371Z'))
  })

  scenario('updates a officeHours', async (scenario) => {
    const original = await officeHours({
      id: scenario.officeHours.one.id,
    })
    const result = await updateOfficeHours({
      id: original.id,
      input: { startTime: 'String2' },
    })

    expect(result.startTime).toEqual('String2')
  })

  scenario('deletes a officeHours', async (scenario) => {
    const original = await deleteOfficeHours({
      id: scenario.officeHours.one.id,
    })
    const result = await officeHours({ id: original.id })

    expect(result).toEqual(null)
  })
})
