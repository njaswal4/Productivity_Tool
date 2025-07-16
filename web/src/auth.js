import { createClient } from '@supabase/supabase-js'

import { createAuth } from '@redwoodjs/auth-supabase-web'

const supabaseClient = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY  || ''
)

export const { AuthProvider, useAuth } = createAuth(supabaseClient)
