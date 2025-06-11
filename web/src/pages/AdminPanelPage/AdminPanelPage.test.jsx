import { render } from '@redwoodjs/testing/web'

import AdminPanelPage from './AdminPanelPage'

//   Improve this test with help from the Redwood Testing Doc:
//   https://redwoodjs.com/docs/testing#testing-pages-layouts

describe('AdminPanelPage', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<AdminPanelPage />)
    }).not.toThrow()
  })
})
