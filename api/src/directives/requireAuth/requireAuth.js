import gql from 'graphql-tag'
import { createValidatorDirective } from '@redwoodjs/graphql-server'

import { logger } from 'src/lib/logger'
import { requireAuth as requireAuthHelper } from 'src/lib/auth'

export const schema = gql`
  """
  Use @requireAuth to validate access to a field, query or mutation.
  """
  directive @requireAuth(roles: [String]) on FIELD_DEFINITION
`

const validate = ({ context, directiveArgs }) => {
  console.log('🔒 DIRECTIVE: requireAuth called')
  console.log('🔒 DIRECTIVE: context.currentUser present:', !!context?.currentUser)
  console.log('🔒 DIRECTIVE: context.currentUser value:', context?.currentUser)
  console.log('🔒 DIRECTIVE: context keys:', Object.keys(context || {}))
  console.log('🔒 DIRECTIVE: directiveArgs:', directiveArgs)

  // Pass context to requireAuthHelper
  requireAuthHelper({ roles: directiveArgs.roles }, context)
}

const requireAuth = createValidatorDirective(schema, validate)

export default requireAuth
