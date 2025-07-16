import { ConfidentialClientApplication } from '@azure/msal-node'

const msalConfig = {
  auth: {
    clientId: process.env.MICROSOFT_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}`,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  },
}

const cca = new ConfidentialClientApplication(msalConfig)

export const acquireTokenByClientCredential = async (scopes) => {
  const clientCredentialRequest = {
    scopes: scopes,
  }

  try {
    const response = await cca.acquireTokenByClientCredential(clientCredentialRequest)
    return response
  } catch (error) {
    console.error('Error acquiring token by client credential:', error)
    throw error
  }
}

export default cca
