import { useAuth } from 'src/auth'
import { navigate, routes } from '@redwoodjs/router'
import { useEffect, useState, useRef } from 'react'
import { MetaTags } from '@redwoodjs/web'

const LoginPage = () => {
  const { isAuthenticated, client, loading } = useAuth()
  const [error, setError] = useState(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const redirectAttemptedRef = useRef(false)
  const sessionCheckTimeoutRef = useRef(null)
  const authListenerRef = useRef(null)

  // Set up auth state listener for OAuth callbacks
  useEffect(() => {
    if (!client?.auth) return

    // Clean up existing listener
    if (authListenerRef.current) {
      authListenerRef.current.subscription?.unsubscribe?.()
    }

    // Listen for auth state changes (OAuth callbacks)
    const { data: authListener } = client.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session ? 'Session exists' : 'No session')
      
      if (event === 'SIGNED_IN' && session && !redirectAttemptedRef.current) {
        console.log('User signed in successfully via OAuth callback')
        
        // Store auth token
        if (typeof window !== 'undefined') {
          localStorage.setItem('supabase-auth-token', session.access_token)
          document.cookie = `supabase-auth-token=${session.access_token};path=/;max-age=3600;SameSite=Lax`
        }
        
        setIsLoggingIn(false)
        
        // Give RedwoodJS auth a moment to catch up, then redirect
        setTimeout(() => {
          redirectAttemptedRef.current = true
          navigate(routes.home())
        }, 200)
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out')
        redirectAttemptedRef.current = false
        setIsLoggingIn(false)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('supabase-auth-token')
          localStorage.removeItem('last_session_check')
        }
      }
    })

    authListenerRef.current = authListener

    return () => {
      if (authListenerRef.current) {
        authListenerRef.current.subscription?.unsubscribe?.()
      }
    }
  }, [client?.auth, navigate])

  // Handle OAuth callback and authentication state
  useEffect(() => {
    // Clear any existing timeout to avoid memory leaks
    if (sessionCheckTimeoutRef.current) {
      clearTimeout(sessionCheckTimeoutRef.current)
    }

    const handleAuthFlow = async () => {
      try {
        // Skip if loading or already processing
        if (loading || redirectAttemptedRef.current) {
          return
        }

        // If already authenticated by RedwoodJS auth, redirect immediately
        if (isAuthenticated) {
          console.log('User is authenticated via RedwoodJS, redirecting to home page')
          redirectAttemptedRef.current = true
          navigate(routes.home())
          return
        }

        // Only run in browser
        if (typeof window === 'undefined') return

        // Check for OAuth callback parameters in URL
        const urlParams = new URLSearchParams(window.location.search)
        const hashParams = new URLSearchParams(window.location.hash.replace('#', ''))
        
        const hasAuthCode = urlParams.get('code') || hashParams.get('access_token')
        
        if (hasAuthCode) {
          console.log('OAuth callback detected, processing authentication...')
          setIsLoggingIn(true)
          
          // Let Supabase handle the OAuth callback
          const { data, error } = await client.auth.getSession()
          
          if (error) {
            console.error('OAuth callback error:', error)
            setError('Authentication failed. Please try again.')
            setIsLoggingIn(false)
            
            // Clean the URL
            window.history.replaceState({}, document.title, window.location.pathname)
            return
          }
          
          if (data?.session) {
            console.log('OAuth callback successful, session established')
            
            // Store auth token
            localStorage.setItem('supabase-auth-token', data.session.access_token)
            document.cookie = `supabase-auth-token=${data.session.access_token};path=/;max-age=3600;SameSite=Lax`
            
            // Clean the URL
            window.history.replaceState({}, document.title, window.location.pathname)
            
            // Force a small delay to ensure RedwoodJS auth catches up
            setTimeout(() => {
              redirectAttemptedRef.current = true
              navigate(routes.home())
            }, 100)
            return
          }
        }
        
        // Regular session check (only if no callback parameters)
        if (!hasAuthCode) {
          // Rate limit checks
          const lastCheck = parseInt(localStorage.getItem('last_session_check') || '0')
          const now = Date.now()
          
          // Only check once every 10 seconds
          if (now - lastCheck < 10000) {
            console.log('Session checked recently, skipping')
            return
          }
          
          localStorage.setItem('last_session_check', now.toString())
          console.log('Checking session status...')
          
          const { data } = await client.auth.getSession()
          
          if (data?.session) {
            console.log('Active session found, redirecting to home page')
            
            // Store auth token
            localStorage.setItem('supabase-auth-token', data.session.access_token)
            document.cookie = `supabase-auth-token=${data.session.access_token};path=/;max-age=3600;SameSite=Lax`
            
            // Small delay to ensure RedwoodJS auth state updates
            setTimeout(() => {
              redirectAttemptedRef.current = true
              navigate(routes.home())
            }, 100)
          } else {
            console.log('No active session found')
            setIsLoggingIn(false)
          }
        }
      } catch (e) {
        console.error('Auth flow error:', e)
        setError('Error during authentication')
        setIsLoggingIn(false)
      }
    }
    
    // Delay to avoid race conditions with RedwoodJS auth
    sessionCheckTimeoutRef.current = setTimeout(() => {
      handleAuthFlow()
    }, 300)
    
    // Clean up timeout on unmount
    return () => {
      if (sessionCheckTimeoutRef.current) {
        clearTimeout(sessionCheckTimeoutRef.current)
      }
    }
  }, [loading, client.auth, navigate, isAuthenticated])

  // Handle Microsoft login button click
  const onLogin = async () => {
    try {
      setIsLoggingIn(true)
      setError(null)
      console.log('Starting Microsoft login process...')
      
      // Clear any redirect prevention flags (only in browser)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('last_session_check')
      }
      redirectAttemptedRef.current = false

      const { data, error } = await client.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo: globalThis?.RWJS_ENV?.SUPABASE_AUTH_REDIRECT_URL || 
                     import.meta.env?.SUPABASE_AUTH_REDIRECT_URL || 
                     (typeof window !== 'undefined' ? `${window.location.origin}/login` : '/login'),
          scopes: 'email profile openid',
          prompt: 'login', // Force login screen to appear
        }
      })

      if (error) {
        console.error('Microsoft login error:', error)
        throw error
      }

      console.log('Login initiated successfully, redirecting to Microsoft...')
      // OAuth redirect will happen automatically - don't set loading to false here
    } catch (error) {
      console.error('Login process failed:', error)
      setError(error.message || 'An error occurred during login')
      setIsLoggingIn(false)
    }
  }

  // Manual refresh of auth session
  const refreshSession = async () => {
    try {
      setIsLoggingIn(true)
      setError(null)
      
      console.log('Manually refreshing session...')
      
      const { data, error } = await client.auth.refreshSession()
      
      if (error) {
        console.error('Session refresh error:', error)
        throw error
      }
      
      if (data?.session) {
        console.log('Session refreshed successfully')
        if (typeof window !== 'undefined') {
          localStorage.setItem('supabase-auth-token', data.session.access_token)
        }
        redirectAttemptedRef.current = false
        
        // Try redirecting to home
        navigate(routes.home())
      } else {
        throw new Error('No session returned')
      }
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
