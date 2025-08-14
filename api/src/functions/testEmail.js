import { sendTestEmail } from 'src/lib/emailService'
import { requireAuth } from 'src/lib/auth'

export const handler = async (event, context) => {
  // Only allow authenticated admins to test email
  try {
    requireAuth({ roles: ['ADMIN'] }, context)
  } catch (error) {
    return {
      statusCode: 403,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Admin access required' }),
    }
  }

  const { email } = JSON.parse(event.body || '{}')
  
  if (!email) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Email address is required' }),
    }
  }

  try {
    const result = await sendTestEmail(email)
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result),
    }
  } catch (error) {
    console.error('Email test failed:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Failed to send test email', 
        details: error.message 
      }),
    }
  }
}
