import { vacationRequests } from './vacationRequests'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('vacationRequests', () => {
  scenario('returns all vacationRequests', async (scenario) => {
    const result = await vacationRequests()

    expect(result.length).toEqual(Object.keys(scenario.vacationRequest).length)
  })
})
