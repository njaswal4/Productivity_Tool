import { render } from '@redwoodjs/testing/web'

import FormModal from './FormModal'

//   Improve this test with help from the Redwood Testing Doc:
//    https://redwoodjs.com/docs/testing#testing-components

describe('FormModal', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<FormModal />)
    }).not.toThrow()
  })
})
