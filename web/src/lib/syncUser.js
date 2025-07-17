// web/src/lib/syncUser.js
import { supabase } from 'src/lib/supabaseClient'
import { db } from 'src/lib/db'

export const syncUserToDB = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  const supaUser = session?.user

  if (!supaUser) return null

  const email = supaUser.email
  const name = supaUser.user_metadata?.name || ''
  const microsoftId = supaUser.identities?.[0]?.id

  const existing = await db.user.findUnique({ where: { email } })

  if (existing) return existing

  return await db.user.create({
    data: {
      email,
      name,
      microsoftId,
      roles: ['USER'],
    },
  })
}
