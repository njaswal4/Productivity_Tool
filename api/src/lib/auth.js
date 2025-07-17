import { db } from 'src/lib/db'
import { AuthenticationError, ForbiddenError } from '@redwoodjs/graphql-server'

/**
 * getCurrentUser returns the user information together with
 * an optional collection of roles used by requireAuth() to check
 * if the user is authenticated or has role-based access.
 *
 * !! BEWARE !! Anything returned from this function will be available to the
 * client--it becomes the content of `currentUser` on the web side (as well as
 * `context.currentUser` on the api side). Only include safe fields.
 */
export const getCurrentUser = async (
  decoded,
  { token, type },
  { event, context }
) => {
  if (!decoded?.email) return null

  // Fetch user from your Prisma database using email from Supabase JWT
  const user = await db.user.findUnique({
    where: { email: decoded.email },
  })

  if (!user) return null

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    roles: user.roles,
  }
}

/**
 * The user is authenticated if there is a currentUser in the context
 */
export const isAuthenticated = () => {
  return !!context.currentUser
}

/**
 * Checks if the currentUser is assigned one of the given roles
 */
export const hasRole = (roles) => {
  if (!isAuthenticated()) return false

  const currentUserRoles = context.currentUser?.roles

  if (typeof roles === 'string') {
    if (typeof currentUserRoles === 'string') {
      return currentUserRoles === roles
    } else if (Array.isArray(currentUserRoles)) {
      return currentUserRoles.includes(roles)
    }
  }

  if (Array.isArray(roles)) {
    if (Array.isArray(currentUserRoles)) {
      return currentUserRoles.some((role) => roles.includes(role))
    } else if (typeof currentUserRoles === 'string') {
      return roles.includes(currentUserRoles)
    }
  }

  return false
}

/**
 * Use requireAuth in your services to check that a user is logged in,
 * and optionally has one of the given roles.
 */
export const requireAuth = ({ roles } = {}) => {
  if (!isAuthenticated()) {
    throw new AuthenticationError("You don't have permission to do that.")
  }

  if (roles && !hasRole(roles)) {
    throw new ForbiddenError("You don't have access to do that.")
  }
}
