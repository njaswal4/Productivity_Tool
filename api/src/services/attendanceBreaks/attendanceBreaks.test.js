import {
  attendanceBreaks,
  attendanceBreak,
  createAttendanceBreak,
  updateAttendanceBreak,
  deleteAttendanceBreak,
} from './attendanceBreaks'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('attendanceBreaks', () => {
  scenario('returns all attendanceBreaks', async (scenario) => {
    const result = await attendanceBreaks()

    expect(result.length).toEqual(Object.keys(scenario.attendanceBreak).length)
  })

  scenario('returns a single attendanceBreak', async (scenario) => {
    const result = await attendanceBreak({
      id: scenario.attendanceBreak.one.id,
    })

    expect(result).toEqual(scenario.attendanceBreak.one)
  })

  scenario('creates a attendanceBreak', async (scenario) => {
    const result = await createAttendanceBreak({
      input: {
        attendanceId: scenario.attendanceBreak.two.attendanceId,
        breakIn: '2025-06-13T20:48:45.692Z',
      },
    })

    expect(result.attendanceId).toEqual(
      scenario.attendanceBreak.two.attendanceId
    )
    expect(result.breakIn).toEqual(new Date('2025-06-13T20:48:45.692Z'))
  })

  scenario('updates a attendanceBreak', async (scenario) => {
    const original = await attendanceBreak({
      id: scenario.attendanceBreak.one.id,
    })
    const result = await updateAttendanceBreak({
      id: original.id,
      input: { breakIn: '2025-06-14T20:48:45.715Z' },
    })

    expect(result.breakIn).toEqual(new Date('2025-06-14T20:48:45.715Z'))
  })

  scenario('deletes a attendanceBreak', async (scenario) => {
    const original = await deleteAttendanceBreak({
      id: scenario.attendanceBreak.one.id,
    })
    const result = await attendanceBreak({ id: original.id })

    expect(result).toEqual(null)
  })
})
