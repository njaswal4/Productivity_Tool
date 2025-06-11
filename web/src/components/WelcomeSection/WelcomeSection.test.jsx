import { render } from '@redwoodjs/testing/web'

import WelcomeSection from './WelcomeSection'

//   Improve this test with help from the Redwood Testing Doc:
//    https://redwoodjs.com/docs/testing#testing-components

describe('WelcomeSection', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<WelcomeSection />)
    }).not.toThrow()
  })
})
