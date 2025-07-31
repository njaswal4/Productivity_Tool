import { useEffect } from 'react'
import { useAuth } from 'src/auth'
import { navigate, routes } from '@redwoodjs/router'

const AuthRedirectPage = () => {
  const { loading, isAuthenticated } = useAuth()

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
