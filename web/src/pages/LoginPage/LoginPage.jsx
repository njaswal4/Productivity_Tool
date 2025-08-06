import { useAuth } from 'src/auth'
import { navigate, routes } from '@redwoodjs/router'
import { useEffect, useState, useRef } from 'react'
import { MetaTags } from '@redwoodjs/web'

const LoginPage = () => {
  const { isAuthenticated, client, loading } = useAuth()
  const [error, setError] = useState(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Simple redirect if already authenticated
  useEffect(() => {
    console.log('Auth state check:', { isAuthenticated, loading })
    
    if (isAuthenticated && !loading) {
      console.log('User is already authenticated, redirecting to home')
      navigate(routes.home())
    }
  }, [isAuthenticated, loading, navigate])

  // Check for session on component mount (after OAuth redirect)
  useEffect(() => {
    const checkForSession = async () => {
      if (loading) return
      
      console.log('Checking for session after component mount...')
      
      try {
        const { data: session, error } = await client.auth.getSession()
        console.log('Session check result:', { session, error })
        
        if (session?.session?.user) {
          console.log('Found active session for user:', session.session.user.email)
          // The isAuthenticated useEffect above should handle the redirect
        } else {
          console.log('No active session found')
        }
      } catch (error) {
        console.error('Error checking session:', error)
      }
    }

    // Small delay to let Supabase process any OAuth callback
    const timeout = setTimeout(checkForSession, 1000)
    
    return () => clearTimeout(timeout)
  }, [client, loading])

  // Listen for auth state changes
  useEffect(() => {
    if (!client?.auth) return

    const { data: authListener } = client.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session ? 'Session exists' : 'No session')
      
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in via auth state change')
        // Let the isAuthenticated useEffect handle the redirect
      }
    })

    return () => {
      authListener.subscription?.unsubscribe?.()
    }
  }, [client?.auth])

  // Handle Microsoft login button click
  const onLogin = async () => {
    try {
      setIsLoggingIn(true)
      setError(null)
      console.log('Starting Microsoft login process...')

      const { data, error } = await client.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo: `${window.location.origin}/login`,
          scopes: 'email profile openid',
          prompt: 'login',
        }
      })

      if (error) {
        console.error('Microsoft login error:', error)
        throw error
      }

      console.log('Login initiated successfully, redirecting to Microsoft...')
      // OAuth redirect will happen automatically
    } catch (error) {
      console.error('Login process failed:', error)
      setError(error.message || 'An error occurred during login')
      setIsLoggingIn(false)
    }
  }

  // Manual refresh session (simplified)
  const refreshSession = async () => {
    try {
      setIsLoggingIn(true)
      setError(null)
      
      const { data, error } = await client.auth.refreshSession()
      
      if (error || !data?.session) {
        throw new Error('Could not refresh session')
      }
      
      console.log('Session refreshed successfully')
      // Let the first useEffect handle the redirect
    } catch (error) {
      console.error('Session refresh failed:', error)
      setError('Could not refresh session. Please log in again.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  return (
    <>
      <MetaTags title="Login" description="Login to access the application" />
      
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
          <div className="text-center">
            <h1 className="mt-2 text-3xl font-extrabold text-gray-900">
              Welcome Back
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to access your account
            </p>
          </div>
          
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 space-y-4">
            <button
              onClick={onLogin}
              disabled={isLoggingIn}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isLoggingIn ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z"></path>
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                  </svg>
                  Sign in with Microsoft
                </span>
              )}
            </button>
            
            {/* Add a session refresh button for recovery */}
            <div className="text-center">
              <button
                onClick={refreshSession}
                disabled={isLoggingIn}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                Already logged in? Click to resume your session
              </button>
            </div>
          </div>
          
          <div className="mt-4 text-center text-xs text-gray-500">
            <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginPage
