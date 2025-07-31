// filepath: c:\2Creative Productivity tool\Productivity_Tool\api\src\services\users\upsertUser.js
import { db } from 'src/lib/db'

export const upsertUser = async ({ input }) => {
  // No auth check here - we'll handle it separately
  console.log('Upserting user with email:', input.email)
  
  const existingUser = await db.user.findUnique({
    where: { email: input.email },
  })

  if (existingUser) {
    console.log('Updating existing user:', existingUser.id)
    return db.user.update({
      data: {
        name: input.name || existingUser.name,
        microsoftId: input.microsoftId || existingUser.microsoftId,
        roles: input.roles || existingUser.roles,
      },
      where: { id: existingUser.id },
    })
  }

  console.log('Creating new user')
  return db.user.create({
    data: input,
  })
}