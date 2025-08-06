import { createClient } from '@supabase/supabase-js'
import { createAuth } from '@redwoodjs/auth-supabase-web'

// Environment variable access for Netlify
const getEnvVar = (key) => {
  // Try different environment variable patterns
  const viteKey = `VITE_${key}`
  
  // Check Vite environment variables (build time)
  if (import.meta.env?.[viteKey]) return import.meta.env[viteKey]
  if (import.meta.env?.[key]) return import.meta.env[key]
  
  // Check RedwoodJS global environment
  if (globalThis?.RWJS_ENV?.[key]) return globalThis.RWJS_ENV[key]
  
  return ''
}

console.log('🔧 Auth configuration:', {
  supabaseUrl: getEnvVar('SUPABASE_URL') ? 'configured' : 'missing',
  supabaseKey: getEnvVar('SUPABASE_KEY') ? 'configured' : 'missing'
})

// Create supabase client with environment variables
const supabaseClient = createClient(
  getEnvVar('SUPABASE_URL'),
  getEnvVar('SUPABASE_KEY')
)

// Create auth with token extraction configured
export const { AuthProvider, useAuth } = createAuth(supabaseClient, {
  // Extract token from Supabase session for API calls
  extractToken: (session) => {
    console.log('🔍 Extracting token from session:', session ? 'has session' : 'no session')
    if (session?.access_token) {
      console.log('✅ Token extracted successfully')
      return session.access_token
    }
    console.log('❌ No access token found')
    return null
  }
})