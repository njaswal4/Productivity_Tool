export const handler = async (event) => {
  console.log('Debug endpoint called')
  
  // Log all headers for debugging
  console.log('Headers received:', JSON.stringify(event.headers, null, 2))
  
  // Extract token if present
  const authHeader = event.headers.authorization || event.headers.Authorization
  let token = null
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7)
    console.log('Token found in Authorization header')
  } else if (event.headers['supabase-auth-token']) {
    token = event.headers['supabase-auth-token']
    console.log('Token found in supabase-auth-token header')
  } else if (event.headers.cookie) {
    // NEW: Extract token from cookies
    const cookies = event.headers.cookie.split(';')
    const tokenCookie = cookies.find(c => c.trim().startsWith('supabase-auth-token='))
    
    if (tokenCookie) {
      token = tokenCookie.split('=')[1].trim()
      console.log('Token found in cookies')
    }
  }
  
  // Try to decode token
  let decodedToken = null
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = Buffer.from(parts[1], 'base64').toString('utf8')
        decodedToken = JSON.parse(payload)
        console.log('Successfully decoded token payload')
      }
    } catch (error) {
      console.error('Error decoding token:', error)
    }
  }
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      success: true,
      message: 'Debug information',
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : null,
      decodedEmail: decodedToken?.email || decodedToken?.user_metadata?.email || null,
      headerKeys: Object.keys(event.headers),
      cookies: event.headers.cookie,
      decodedToken: decodedToken, // Include full decoded token
    }),
  }
}