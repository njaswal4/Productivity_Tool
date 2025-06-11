import { render } from '@redwoodjs/testing/web'

import Code from './Code'

//   Improve this test with help from the Redwood Testing Doc:
//    https://redwoodjs.com/docs/testing#testing-components

describe('Code', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<Code />)
    }).not.toThrow()
  })
})
