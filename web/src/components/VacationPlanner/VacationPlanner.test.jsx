import { render } from '@redwoodjs/testing/web'

import VacationPlanner from './VacationPlanner'

//   Improve this test with help from the Redwood Testing Doc:
//    https://redwoodjs.com/docs/testing#testing-components

describe('VacationPlanner', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<VacationPlanner />)
    }).not.toThrow()
  })
})
