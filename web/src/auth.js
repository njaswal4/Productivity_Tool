import { createClient } from '@supabase/supabase-js'
import { createAuth } from '@redwoodjs/auth-supabase-web'

const supabaseClient = createClient(
  import.meta.env?.SUPABASE_URL || 'https://placeholder.supabase.co',
  import.meta.env?.SUPABASE_KEY || 'placeholder-anon-key'
)

export const { AuthProvider, useAuth } = createAuth(supabaseClient)