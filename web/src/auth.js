import { createClient } from '@supabase/supabase-js'
import { createAuth } from '@redwoodjs/auth-supabase-web'

// Use hardcoded values during SSR/build, environment variables in browser
const supabaseClient = createClient(
  typeof window !== 'undefined' 
    ? (import.meta.env?.SUPABASE_URL || 'https://ietxptztlrlbcnjdjicc.supabase.co')
    : 'https://ietxptztlrlbcnjdjicc.supabase.co',
  typeof window !== 'undefined'
    ? (import.meta.env?.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlldHhwdHp0bHJsYmNuamRqaWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MTIzNzUsImV4cCI6MjA2ODE4ODM3NX0.uZG7jNMUmGXqbJg4YSWdc2-tgdLpFKCNsjHLQnxNI3I')
    : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlldHhwdHp0bHJsYmNuamRqaWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MTIzNzUsImV4cCI6MjA2ODE4ODM3NX0.uZG7jNMUmGXqbJg4YSWdc2-tgdLpFKCNsjHLQnxNI3I'
)

export const { AuthProvider, useAuth } = createAuth(supabaseClient)