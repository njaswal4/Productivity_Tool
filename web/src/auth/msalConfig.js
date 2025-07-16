export const msalConfig = {
  auth: {
    clientId: '8194034c-caac-441d-b9f8-fb7b23606bc9', 
    authority: 'https://login.microsoftonline.com/bbc8bba7-e3e4-4307-941b-0eef3af2f9b3', 
    redirectUri: 'https://ietxptztlrlbcnjdjicc.supabase.co/auth/v1/callback', 
    postLogoutRedirectUri: 'http://localhost:8910/login', 
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: true,
  },
}

// Add scope for Microsoft Graph API
export const loginRequest = {
  scopes: ['User.Read', 'profile', 'email', 'openid'],
}


export const allowedDomains = ['2cretiv.com']

