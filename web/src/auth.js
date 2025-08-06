import { createClient } from '@supabase/supabase-js'
import { createAuth } from '@redwoodjs/auth-supabase-web'

// Create supabase client with environment variables
// These will be provided by Netlify's environment variables during build/runtime
const supabaseClient = createClient(
  globalThis?.RWJS_ENV?.SUPABASE_URL || import.meta.env?.SUPABASE_URL || '',
  globalThis?.RWJS_ENV?.SUPABASE_KEY || import.meta.env?.SUPABASE_KEY || ''
)

export const { AuthProvider, useAuth } = createAuth(supabaseClient)