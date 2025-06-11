import { render } from '@redwoodjs/testing/web'

import UpcomingBookings from './UpcomingBookings'

//   Improve this test with help from the Redwood Testing Doc:
//    https://redwoodjs.com/docs/testing#testing-components

describe('UpcomingBookings', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<UpcomingBookings />)
    }).not.toThrow()
  })
})
