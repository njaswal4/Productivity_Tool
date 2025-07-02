import { FatalErrorBoundary, RedwoodProvider } from '@redwoodjs/web'
import { RedwoodApolloProvider } from '@redwoodjs/web/apollo'
import FatalErrorPage from 'src/pages/FatalErrorPage'


import { AuthProvider, useAuth } from './auth'

import './index.css'
import './scaffold.css'
import TextCursor from '../../src/blocks/TextAnimations/TextCursor/TextCursor'


const App = ({ children }) => (
  <FatalErrorBoundary page={FatalErrorPage}>
    <RedwoodProvider titleTemplate="%PageTitle | %AppTitle">
      <AuthProvider>
        <RedwoodApolloProvider useAuth={useAuth}>
           {/* Global cursor effect, covers the whole viewport */}
      <div className="fixed inset-0 z-[9999] pointer-events-none">
        <TextCursor
          text="2creative"
          imageSrc="/img.png"
          delay={0.01}
          spacing={80}
          followMouseDirection={true}
          randomFloat={true}
          exitDuration={0.3}
          removalInterval={20}
          maxPoints={10}
        />
      </div>
          {children}
          </RedwoodApolloProvider>
      </AuthProvider>
    </RedwoodProvider>
  </FatalErrorBoundary>
)

export default App
