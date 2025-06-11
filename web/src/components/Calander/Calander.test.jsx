import { render } from '@redwoodjs/testing/web'

import Calander from './Calander'

//   Improve this test with help from the Redwood Testing Doc:
//    https://redwoodjs.com/docs/testing#testing-components

describe('Calander', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<Calander />)
    }).not.toThrow()
  })
})
