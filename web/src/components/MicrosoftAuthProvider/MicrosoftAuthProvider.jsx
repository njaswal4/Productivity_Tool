import React, { createContext, useContext, useState, useEffect } from 'react'
import { PublicClientApplication, EventType } from '@azure/msal-browser'
import { msalConfig, loginRequest, allowedDomains } from '../../auth/msalConfig'

const MicrosoftAuthContext = createContext()

export const MicrosoftAuthProvider = ({ children }) => {
  const [msalInstance, setMsalInstance] = useState(null)
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(async () => {
    const msalApp = new PublicClientApplication(msalConfig)
    await msalApp.initialize()
    // Handle redirect response
    msalApp.handleRedirectPromise().then(response => {
      if (response) {
        const account = response.account
        setAccount(account)
      }
    }).catch(err => {
      setError(err)
      console.error("Redirect error:", err)
    })

    // Set active account if available
    const accounts = msalApp.getAllAccounts()
    if (accounts.length > 0) {
      setAccount(accounts[0])
    }

    // Subscribe to account changes
    const accountChangedCallback = (event) => {
      if (event.eventType === EventType.LOGIN_SUCCESS && event.payload.account) {
        const account = event.payload.account
        setAccount(account)
      }
    }
    
    msalApp.addEventCallback(accountChangedCallback)
    setMsalInstance(msalApp)
    setLoading(false)

    return () => {
      if (msalApp) {
        msalApp.removeEventCallback(accountChangedCallback)
      }
    }
  }, [])

  // Verify if user is from allowed domain
  const isAllowedDomain = () => {
    if (!account || !account.username) return false
    const emailDomain = account.username.split('@')[1]
    return allowedDomains.includes(emailDomain)
  }

  const login = async () => {
    if (!msalInstance) return
    
    try {
      await msalInstance.loginRedirect(loginRequest)
    } catch (err) {
      setError(err)
      console.error("Login error:", err)
    }
  }

  const logout = () => {
    if (msalInstance && account) {
      msalInstance.logout({
        account: msalInstance.getAccountByUsername(account.username)
      })
    }
  }

  const getUserInfo = async () => {
    if (!account) return null
    
    if (!isAllowedDomain()) {
      logout() // Log out users with non-allowed domains
      setError(new Error('Only 2Creative employees can access this application'))
      return null
    }
    
    return {
      id: account.localAccountId,
      name: account.name,
      email: account.username,
      roles: [], // You'll need to set roles based on your application's logic
    }
  }

  const value = {
    isAuthenticated: !!account && isAllowedDomain(),
    loading,
    error,
    login,
    logout,
    account,
    getUserInfo,
  }

  return (
    <MicrosoftAuthContext.Provider value={value}>
      {children}
    </MicrosoftAuthContext.Provider>
  )
}

export const useMicrosoftAuth = () => useContext(MicrosoftAuthContext)