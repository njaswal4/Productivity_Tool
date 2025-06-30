import { render } from '@redwoodjs/testing/web'

import ExceptionForm from './ExceptionForm'

//   Improve this test with help from the Redwood Testing Doc:
//    https://redwoodjs.com/docs/testing#testing-components

describe('ExceptionForm', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<ExceptionForm />)
    }).not.toThrow()
  })
})
