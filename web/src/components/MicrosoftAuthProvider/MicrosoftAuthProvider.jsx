import React, { createContext, useContext, useState, useEffect } from 'react'
import supabase from 'src/lib/supabaseClient'

const AuthContext = createContext()

export const MicrosoftAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const session = supabase.auth.session()
    setUser(session?.user ?? null)

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      authListener?.unsubscribe()
    }
  }, [])

  const login = async () => {
    const { error } = await supabase.auth.signIn(
      { provider: 'azure' },
      { redirectTo: window.location.origin }
    )
    if (error) throw error
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const isAuthorized = () => {
    if (!user) return false
    return user.email.endsWith('@2cretiv.com')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthorized, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useMicrosoftAuth = () => {
  return useContext(AuthContext)
}
