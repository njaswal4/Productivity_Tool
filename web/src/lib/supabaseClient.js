import { createClient } from '@supabase/supabase-js'

// These now resolve at build time
const supabaseUrl      = import.meta.env.VITE_SUPABASE_URL || ''
  
const supabaseAnonKey  = import.meta.env.VITE_SUPABASE_ANON_KEY  || ''

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
}
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Present' : 'Missing')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase
