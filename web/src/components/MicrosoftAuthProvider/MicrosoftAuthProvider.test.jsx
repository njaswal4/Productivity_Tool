import { render } from '@redwoodjs/testing/web'

import MicrosoftAuthProvider from './MicrosoftAuthProvider'

//   Improve this test with help from the Redwood Testing Doc:
//    https://redwoodjs.com/docs/testing#testing-components

describe('MicrosoftAuthProvider', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<MicrosoftAuthProvider />)
    }).not.toThrow()
  })
})
