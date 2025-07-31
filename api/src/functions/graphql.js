import { authDecoder } from '@redwoodjs/auth-supabase-api'
import { createGraphQLHandler } from '@redwoodjs/graphql-server'

import directives from 'src/directives/**/*.{js,ts}'
import sdls from 'src/graphql/**/*.sdl.{js,ts}'
import services from 'src/services/**/*.{js,ts}'

import { getCurrentUser } from 'src/lib/auth'
import { db } from 'src/lib/db'
import { logger } from 'src/lib/logger'

export const handler = createGraphQLHandler({
  authDecoder,
  getCurrentUser,
  loggerConfig: { 
    logger, 
    options: { 
      data: false,
      level: 'info'
    } 
  },
  directives,
  sdls,
  services,
  cors: {
    origin: true,
    credentials: true,
  },
  onException: () => {
    db.$disconnect()
  },
})
