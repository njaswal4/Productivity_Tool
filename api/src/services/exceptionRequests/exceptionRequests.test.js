import {
  exceptionRequests,
  exceptionRequest,
  createExceptionRequest,
  updateExceptionRequest,
  deleteExceptionRequest,
} from './exceptionRequests'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('exceptionRequests', () => {
  scenario('returns all exceptionRequests', async (scenario) => {
    const result = await exceptionRequests()

    expect(result.length).toEqual(Object.keys(scenario.exceptionRequest).length)
  })

  scenario('returns a single exceptionRequest', async (scenario) => {
    const result = await exceptionRequest({
      id: scenario.exceptionRequest.one.id,
    })

    expect(result).toEqual(scenario.exceptionRequest.one)
  })

  scenario('creates a exceptionRequest', async (scenario) => {
    const result = await createExceptionRequest({
      input: {
        userId: scenario.exceptionRequest.two.userId,
        type: 'String',
        reason: 'String',
        date: '2025-06-05T20:29:28.184Z',
        status: 'String',
      },
    })

    expect(result.userId).toEqual(scenario.exceptionRequest.two.userId)
    expect(result.type).toEqual('String')
    expect(result.reason).toEqual('String')
    expect(result.date).toEqual(new Date('2025-06-05T20:29:28.184Z'))
    expect(result.status).toEqual('String')
  })

  scenario('updates a exceptionRequest', async (scenario) => {
    const original = await exceptionRequest({
      id: scenario.exceptionRequest.one.id,
    })
    const result = await updateExceptionRequest({
      id: original.id,
      input: { type: 'String2' },
    })

    expect(result.type).toEqual('String2')
  })

  scenario('deletes a exceptionRequest', async (scenario) => {
    const original = await deleteExceptionRequest({
      id: scenario.exceptionRequest.one.id,
    })
    const result = await exceptionRequest({ id: original.id })

    expect(result).toEqual(null)
  })
})
