import { render } from '@redwoodjs/testing/web'

import AttendanceCard from './AttendanceCard'

//   Improve this test with help from the Redwood Testing Doc:
//    https://redwoodjs.com/docs/testing#testing-components

describe('AttendanceCard', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<AttendanceCard />)
    }).not.toThrow()
  })
})
