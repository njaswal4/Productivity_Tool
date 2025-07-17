import React, { createContext, useContext, useState, useEffect } from 'react'
import supabase from 'src/lib/supabaseClient'

const AuthContext = createContext()

export const MicrosoftAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) console.error('Error fetching session:', error)

      setUser(session?.user ?? null)
      setAccessToken(session?.provider_token ?? null)
      setLoading(false)
    }

    getSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setAccessToken(session?.provider_token ?? null)
      setLoading(false)
    })

    return () => {
      authListener?.subscription?.unsubscribe?.()
    }
  }, [])

  const login = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        scopes: ['email', 'profile', 'openid', 'User.Read', 'offline_access'],
        redirectTo: 'https://ietxptztlrlbcnjdjicc.supabase.co/auth/v1/callback',
      },
    })
    if (error) throw error
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const isAuthorized = () => {
    if (!user?.email) return false
    return user.email.endsWith('@2cretiv.com')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        login,
        logout,
        isAuthorized,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useMicrosoftAuth = () => useContext(AuthContext)
