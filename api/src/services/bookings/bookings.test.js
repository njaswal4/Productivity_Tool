import {
  bookings,
  booking,
  createBooking,
  updateBooking,
  deleteBooking,
} from './bookings'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('bookings', () => {
  scenario('returns all bookings', async (scenario) => {
    const result = await bookings()

    expect(result.length).toEqual(Object.keys(scenario.booking).length)
  })

  scenario('returns a single booking', async (scenario) => {
    const result = await booking({ id: scenario.booking.one.id })

    expect(result).toEqual(scenario.booking.one)
  })

  scenario('creates a booking', async (scenario) => {
    const result = await createBooking({
      input: {
        title: 'String',
        startTime: '2025-06-04T15:47:45.481Z',
        endTime: '2025-06-04T15:47:45.481Z',
        userId: scenario.booking.two.userId,
      },
    })

    expect(result.title).toEqual('String')
    expect(result.startTime).toEqual(new Date('2025-06-04T15:47:45.481Z'))
    expect(result.endTime).toEqual(new Date('2025-06-04T15:47:45.481Z'))
    expect(result.userId).toEqual(scenario.booking.two.userId)
  })

  scenario('updates a booking', async (scenario) => {
    const original = await booking({ id: scenario.booking.one.id })
    const result = await updateBooking({
      id: original.id,
      input: { title: 'String2' },
    })

    expect(result.title).toEqual('String2')
  })

  scenario('deletes a booking', async (scenario) => {
    const original = await deleteBooking({
      id: scenario.booking.one.id,
    })
    const result = await booking({ id: original.id })

    expect(result).toEqual(null)
  })
})
