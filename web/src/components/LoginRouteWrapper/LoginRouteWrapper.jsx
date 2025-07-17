import { useEffect } from 'react'
import { useAuth } from 'src/auth'
import { navigate, routes } from '@redwoodjs/router'

const LoginRouteWrapper = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      // only ever run once
      navigate(routes.home())
    }
  }, [isAuthenticated, loading])

  // render nothing while auth is resolving or user is already in
  if (loading || isAuthenticated) {
    return null
  }

  // finally, show the login page
  return <>{children}</>
}

export default LoginRouteWrapper
