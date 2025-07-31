export const handler = async (event) => {
  console.log('Auth test endpoint called');
  
  // Log all headers for debugging
  console.log('Headers received:', JSON.stringify(event.headers || {}, null, 2));
  
  // Try to extract token
  let token = null;
  let tokenSource = null;
  
  if (event.headers?.authorization) {
    const authHeader = event.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      tokenSource = 'Authorization header';
    }
  }
  
  if (!token && event.headers?.cookie) {
    const cookies = event.headers.cookie.split(';');
    
    // Try Authorization cookie
    const authCookie = cookies.find(c => c.trim().startsWith('Authorization='));
    if (authCookie) {
      const value = authCookie.split('=')[1].trim();
      if (value.startsWith('Bearer ')) {
        token = value.substring(7);
        tokenSource = 'Authorization cookie';
      }
    }
    
    // Try supabase cookie
    if (!token) {
      const supabaseCookie = cookies.find(c => c.trim().startsWith('supabase-auth-token='));
      if (supabaseCookie) {
        token = supabaseCookie.split('=')[1].trim();
        tokenSource = 'supabase-auth-token cookie';
      }
    }
  }
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      success: true,
      hasToken: !!token,
      tokenSource,
      headerKeys: Object.keys(event.headers || {}),
      cookies: event.headers?.cookie || null,
    }),
  };
};