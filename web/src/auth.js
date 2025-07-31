import { createClient } from '@supabase/supabase-js'
import { createAuth } from '@redwoodjs/auth-supabase-web'

const supabaseClient = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_KEY
)

export const { AuthProvider, useAuth } = createAuth(supabaseClient)