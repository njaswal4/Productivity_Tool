import { render } from '@redwoodjs/testing/web'

import Attendance from './Attendance'

//   Improve this test with help from the Redwood Testing Doc:
//    https://redwoodjs.com/docs/testing#testing-components

describe('Attendance', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<Attendance />)
    }).not.toThrow()
  })
})
