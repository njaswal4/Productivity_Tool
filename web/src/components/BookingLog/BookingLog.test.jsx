import { render } from '@redwoodjs/testing/web'

import BookingLog from './BookingLog'

//   Improve this test with help from the Redwood Testing Doc:
//    https://redwoodjs.com/docs/testing#testing-components

describe('BookingLog', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<BookingLog />)
    }).not.toThrow()
  })
})
