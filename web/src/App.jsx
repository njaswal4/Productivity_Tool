import { FatalErrorBoundary, RedwoodProvider } from '@redwoodjs/web'
import { ApolloProvider } from '@apollo/client'

import FatalErrorPage from 'src/pages/FatalErrorPage'
import Routes from 'src/Routes'

import { AuthProvider } from './auth/index'
import { Toaster } from '@redwoodjs/web/toast'

import client from 'src/lib/apolloClient'

import './index.css'

const App = () => (
  <FatalErrorBoundary page={FatalErrorPage}>
    <RedwoodProvider titleTemplate="%PageTitle | %AppTitle">
      <AuthProvider>
        <ApolloProvider client={client}>
          <Toaster toastOptions={{ duration: 6000 }} />
          <Routes />
        </ApolloProvider>
      </AuthProvider>
    </RedwoodProvider>
  </FatalErrorBoundary>
)

export default App
