import { render } from '@redwoodjs/testing/web'

import LocationStatus from './LocationStatus'

//   Improve this test with help from the Redwood Testing Doc:
//    https://redwoodjs.com/docs/testing#testing-components

describe('LocationStatus', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<LocationStatus />)
    }).not.toThrow()
  })
})
