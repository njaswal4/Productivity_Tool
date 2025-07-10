import { AuthenticationError } from '@redwoodjs/graphql-server'

/**
 * Represents the user attributes returned by the decoding the
 * Authentication provider's JWT token.
 */
export const getCurrentUser = async (decoded, { _req, _context }) => {
  // If ID not in token, throw error
  if (!decoded?.sub) {
    throw new AuthenticationError('Invalid or missing user ID')
  }
  
  // If email domain is not allowed, reject
  if (!decoded.email || !decoded.email.endsWith('@2cretiv.com')) {
    throw new AuthenticationError('Only 2Creative employees can access this application')
  }
  
  // Find or create user in database
  const user = await db.user.upsert({
    where: { microsoftId: decoded.sub },
    create: {
      microsoftId: decoded.sub,
      email: decoded.email,
      name: decoded.name || decoded.email.split('@')[0],
      roles: ['USER']
    },
    update: {
      email: decoded.email,
      name: decoded.name || decoded.email.split('@')[0],
    }
  })
  
  return {
    ...user,
    roles: user.roles
  }
}

/**
 * The user is authenticated if there is a currentUser in the context
 */
export const isAuthenticated = () => {
  return !!context.currentUser
}

/**
 * Checks if the currentUser is assigned a role
 */
export const hasRole = (roles) => {
  if (!isAuthenticated()) {
    return false
  }

  if (typeof roles === 'string') {
    if (context.currentUser.roles?.includes(roles)) {
      return true
    }
  }

  if (Array.isArray(roles)) {
    if (
      context.currentUser.roles?.some((r) => roles.includes(r))
    ) {
      return true
    }
  }

  return false
}