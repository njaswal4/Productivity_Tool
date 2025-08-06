import { authDecoder } from '@redwoodjs/auth-supabase-api'
import { createGraphQLHandler } from '@redwoodjs/graphql-server'
import jwt from 'jsonwebtoken'

import directives from 'src/directives/**/*.{js,ts}'
import sdls from 'src/graphql/**/*.sdl.{js,ts}'
import services from 'src/services/**/*.{js,ts}'

import { getCurrentUser } from 'src/lib/auth'
import { db } from 'src/lib/db'
import { logger } from 'src/lib/logger'

// Custom auth decoder that extracts token from cookie
const customAuthDecoder = (token, type, req) => {
  console.log('🔍 Custom auth decoder called:', { 
    token: token ? 'present' : 'missing', 
    type,
    cookies: req.headers.cookie ? 'has cookies' : 'no cookies'
  })

  // If no token provided, try to extract from cookie
  if (!token && req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {})
    
    if (cookies['supabase-auth-token']) {
      token = cookies['supabase-auth-token']
      console.log('✅ Extracted token from cookie')
    }
  }

  if (!token) {
    console.log('❌ No token found in headers or cookies')
    return { currentUser: null }
  }

  try {
    // Verify and decode the JWT token
    const decoded = jwt.decode(token)
    console.log('🎯 Token decoded successfully:', { email: decoded?.email })
    return decoded
  } catch (error) {
    console.error('❌ Token decode error:', error)
    return { currentUser: null }
  }
}

export const handler = createGraphQLHandler({
  authDecoder: customAuthDecoder,
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
