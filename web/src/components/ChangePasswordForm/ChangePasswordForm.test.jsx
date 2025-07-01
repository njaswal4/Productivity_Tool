import { render } from '@redwoodjs/testing/web'

import ChangePasswordForm from './ChangePasswordForm'

//   Improve this test with help from the Redwood Testing Doc:
//    https://redwoodjs.com/docs/testing#testing-components

describe('ChangePasswordForm', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<ChangePasswordForm />)
    }).not.toThrow()
  })
})
