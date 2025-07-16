import { useEffect } from 'react'
import { useMicrosoftAuth } from 'src/components/MicrosoftAuthProvider/MicrosoftAuthProvider'
import { navigate, routes } from '@redwoodjs/router'

const AuthRedirectPage = () => {
  const { loading, isAuthenticated } = useMicrosoftAuth()

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        navigate(routes.home())
      } else {
        navigate(routes.login())
      }
    }
  }, [loading, isAuthenticated])

  return null
}

export default AuthRedirectPage
