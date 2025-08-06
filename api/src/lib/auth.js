import jwt from 'jsonwebtoken';
import { AuthenticationError, ForbiddenError } from '@redwoodjs/graphql-server'
import { db } from 'src/lib/db'

/**
 * The session object sent in as the first argument to getCurrentUser() will
 * have a single key `id` containing the unique ID of the logged in user
 * (whatever field you set as `authFields.id` in your auth function config).
 * You'll need to update the call below to the service that will return
 * the user.
 *
 * !! BEWARE !! Anything returned from this function will be available to the
 * client--it becomes the content of `currentUser` on the web side (as well as
 * `context.currentUser` on the api side). You should carefully add additional
 * fields to the `select` object below once you've decided they are safe to be
 * seen if someone were to open the Web Inspector in their browser.
 */

/**
 * Decodes the token and returns the current user object for context.currentUser
 * The decoded JWT payload is sent as the first argument to getCurrentUser().
 * For Supabase, this contains the user information from the JWT token.
 */
export const getCurrentUser = async (decoded) => {
  console.log('🔍 getCurrentUser called with decoded JWT:', decoded);
  
  // TEMPORARY: For demo purposes, return a mock user when no auth
  if (!decoded) {
    console.log('❌ No decoded JWT provided - returning demo user');
    return {
      id: 1,
      email: 'demo@2cretiv.com',
      roles: ['USER'],
      name: 'Demo User'
    };
  }

  // Extract user data from the JWT payload
  // Supabase JWT structure: { sub: userId, email: email, user_metadata: {...}, ... }
  const email = decoded.email;
  const userMetadata = decoded.user_metadata || {};
  
  console.log('🔍 Extracted email:', email);
  console.log('🔍 User metadata:', userMetadata);
  
  if (!email) {
    console.log('❌ No email found in JWT payload');
    return null;
  }

  // Find or create user
  const user = await findOrCreateUser(email, userMetadata);
  console.log('🚀 FINAL: Returning user from getCurrentUser:', user ? { id: user.id, email: user.email, roles: user.roles } : 'null');
  
  return user;
}

/**
 * Helper function to find or create a user with the given email
 */
async function findOrCreateUser(email, userMetadata = {}) {
  try {
    if (!email) {
      console.log('No email provided to findOrCreateUser');
      return null;
    }
    console.log('Looking up user with email:', email);
    let user = null;
    try {
      user = await db.user.findUnique({ where: { email } });
      console.log('findUnique result:', user);
    } catch (findErr) {
      console.error('Error during findUnique:', findErr);
    }
    if (!user) {
      console.log('User not found, creating new user');
      const name = userMetadata?.full_name || email.split('@')[0];
      try {
        user = await db.user.create({
          data: {
            email,
            name,
            roles: ['USER'],
            ...(userMetadata?.custom_claims?.oid && {
              microsoftId: userMetadata.custom_claims.oid
            }),
          },
        });
        console.log('Created new user with ID:', user.id);
      } catch (createErr) {
        console.error('Error during user creation:', createErr);
        return null;
      }
    } else {
      console.log('Found existing user:', user.id);
      if (userMetadata?.full_name && user.name !== userMetadata.full_name) {
        console.log('Updating user name to:', userMetadata.full_name);
        try {
          user = await db.user.update({
            where: { id: user.id },
            data: { 
              name: userMetadata.full_name,
              ...(userMetadata?.custom_claims?.oid && {
                microsoftId: userMetadata.custom_claims.oid
              }),
            }
          });
        } catch (updateErr) {
          console.error('Error during user update:', updateErr);
        }
      }
    }
    return {
      ...user,
      roles: user.roles || ['USER'],
    };
  } catch (error) {
    console.error('Error in findOrCreateUser (outer catch):', error);
    return null;
  }
}

/**
 * Use requireAuth in your services to check that a user is logged in,
 * whether or not they are assigned a role, and optionally raise an
 * error if they're not.
 *
 * @param {string=} roles - An optional role or list of roles
 * @param {string[]=} roles - An optional list of roles

 * @returns - If the currentUser is authenticated (and assigned one of the
 *   given roles)
 *
 * @throws {AuthenticationError} - If the currentUser is not authenticated
 * @throws {ForbiddenError} If the currentUser is not allowed due to role permissions
 *
 * @see https://github.com/redwoodjs/redwood/tree/main/packages/auth#validators
 */
export const requireAuth = ({ roles } = {}, context) => {
  console.log('requireAuth called with:', { 
    roles, 
    currentUser: context?.currentUser,
    contextKeys: context ? Object.keys(context) : 'no context'
  });
  
  if (!isAuthenticated(context)) {
    console.log('Authentication failed - no currentUser found');
    throw new AuthenticationError("You don't have permission to do that.")
  }

  if (roles && !hasRole(roles, context)) {
    console.log('Role authorization failed');
    throw new ForbiddenError("You don't have access to do that.")
  }
  
  console.log('requireAuth passed successfully');
}

/**
 * Use skipAuth to skip authentication checks and allow public access.
 *
 * @returns - If the currentUser is authenticated (and assigned one of the
 *   given roles)
 *
 * @throws {AuthenticationError} - If the currentUser is not authenticated
 * @throws {ForbiddenError} If the currentUser is not allowed due to role permissions
 *
 * @see https://github.com/redwoodjs/redwood/tree/main/packages/auth#validators
 */
export const skipAuth = () => {
  return true
}

/**
 * Check if the current user is authenticated (signed in)
 *
 * @returns {boolean} - `true` if the currentUser is signed in, `false` otherwise. Falls back to `false`
 */
export const isAuthenticated = (context) => {
  console.log('isAuthenticated called, context?.currentUser:', context?.currentUser ? 'PRESENT' : 'NOT PRESENT');
  return !!context?.currentUser
}

/**
 * Check if the current user is assigned one of the given roles.
 * Checks against `currentUser.roles` (which is a list of strings)
 *
 * @param {string|string[]} roles - A single role or list of roles to check
 *
 * @returns {boolean} - `true` if the currentUser is assigned one of the given roles, `false` otherwise.
 */
export const hasRole = (roles, context) => {
  if (!isAuthenticated(context)) {
    return false
  }

  const currentUserRoles = context.currentUser?.roles?.map((r) =>
    typeof r === 'string' ? r : r.name
  )

  if (typeof roles === 'string') {
    if (typeof currentUserRoles?.includes === 'function') {
      return currentUserRoles.includes(roles)
    } else {
      console.warn(
        "You called hasRole() but no currentUser.roles exists. Have you configured getCurrentUser() in your auth functions?"
      )
    }
  }

  if (Array.isArray(roles)) {
    if (Array.isArray(currentUserRoles)) {
      return currentUserRoles.some((r) => roles.includes(r))
    } else {
      console.warn(
        "You called hasRole() but no currentUser.roles exists. Have you configured getCurrentUser() in your auth functions?"
      )
    }
  }

  return false
}
