import { sendTestEmail } from 'src/lib/emailService'

// Helper function to detect email provider with enhanced custom domain support
const getEmailProvider = (email) => {
  const domain = email.split('@')[1]?.toLowerCase()
  
  if (domain?.includes('outlook') || domain?.includes('hotmail') || domain?.includes('live') || domain?.includes('msn')) {
    return 'outlook'
  } else if (domain?.includes('gmail')) {
    return 'gmail'
  } else if (domain?.includes('yahoo')) {
    return 'yahoo'
  } else if (domain?.includes('2cretiv') || domain?.includes('2cretiv')) {
    return '2creative'
  
  } else if (domain?.includes('edu') || domain?.includes('ac.') || domain?.includes('university')) {
    return 'educational'
  } else if (domain?.includes('gov') || domain?.includes('mil')) {
    return 'government'
  } else {
    // Check if it's a custom business domain (not a major provider)
    const commonProviders = ['gmail', 'outlook', 'yahoo', 'hotmail', 'live', 'aol', 'protonmail', 'icloud']
    const isCustomDomain = !commonProviders.some(provider => domain?.includes(provider))
    return isCustomDomain ? 'custom-domain' : 'other'
  }
}

export const testEmailDelivery = async ({ recipientEmail }) => {
  try {
    console.log('🧪 Testing email delivery to:', recipientEmail)
    
    const provider = getEmailProvider(recipientEmail)
    console.log('📧 Detected email provider:', provider)
    
    const result = await sendTestEmail(recipientEmail)
    
    return {
      ...result,
      provider,
      timestamp: new Date(),
      messageId: result.messageId || null
    }
  } catch (error) {
    console.error('❌ Email delivery test failed:', error)
    return {
      success: false,
      error: error.message,
      provider: getEmailProvider(recipientEmail),
      timestamp: new Date()
    }
  }
}

export const sendOutlookTestEmail = async ({ recipientEmail }) => {
  try {
    console.log('🔍 Sending Outlook-specific test email to:', recipientEmail)
    
    const provider = getEmailProvider(recipientEmail)
    
    if (provider !== 'outlook') {
      console.warn('⚠️ Warning: Email is not an Outlook address, but sending anyway')
    }
    
    const result = await sendTestEmail(recipientEmail)
    
    // Add specific Outlook guidance
    if (result.success) {
      result.message = `${result.message} For Outlook users: Please check your spam/junk folder if the email doesn't appear in your inbox within 5 minutes.`
    }
    
    return {
      ...result,
      provider,
      timestamp: new Date(),
      messageId: result.messageId || null
    }
  } catch (error) {
    console.error('❌ Outlook email test failed:', error)
    return {
      success: false,
      error: error.message,
      provider: getEmailProvider(recipientEmail),
      timestamp: new Date()
    }
  }
}

export const sendCustomDomainTest = async ({ recipientEmail }) => {
  try {
    console.log('🏢 Sending custom domain test email to:', recipientEmail)
    
    const provider = getEmailProvider(recipientEmail)
    const domain = recipientEmail.split('@')[1]?.toLowerCase()
    
    console.log('🔍 Detected provider:', provider, 'for domain:', domain)
    
    // Enhanced test for custom domains
    const result = await sendTestEmail(recipientEmail)
    
    // Add custom domain specific information
    let domainInfo = `Testing email delivery to custom domain: ${domain}`
    let deliveryTips = ''
    
    if (provider === 'custom-domain') {
      domainInfo = `Custom business domain detected: ${domain}. Email delivery depends on the domain's email server configuration, security policies, and spam filtering rules.`
      deliveryTips = 'For custom domains: 1) Check spam/junk folder, 2) Contact domain administrator if not received, 3) May require sender domain authentication (SPF/DKIM/DMARC), 4) Some business domains block external emails by default'
    } else if (provider === '2creative') {
      domainInfo = `2Creative company email detected. This is an internal company domain.`
      deliveryTips = 'For 2Creative emails: 1) Check company spam policies, 2) Contact IT administrator if issues persist, 3) Ensure sender is whitelisted in company email security'
    } else if (provider === 'educational') {
      domainInfo = `Educational institution domain detected: ${domain}`
      deliveryTips = 'For educational emails: 1) Very strict spam filtering, 2) May require sender domain whitelisting, 3) Contact IT support, 4) Check institutional email policies'
    } else if (provider === 'government') {
      domainInfo = `Government domain detected: ${domain}`
      deliveryTips = 'For government emails: 1) Extremely strict security policies, 2) May block all external emails, 3) Contact IT security team, 4) Formal sender authorization may be required'
    }
    
    if (result.success) {
      result.message = `${result.message} Domain-specific test completed for ${domain}.`
    }
    
    return {
      ...result,
      provider,
      timestamp: new Date(),
      deliveryTips,
      domainInfo,
      messageId: result.messageId || null
    }
  } catch (error) {
    console.error('❌ Custom domain email test failed:', error)
    return {
      success: false,
      error: error.message,
      provider: getEmailProvider(recipientEmail),
      timestamp: new Date(),
      deliveryTips: 'Email delivery failed. Check email configuration and domain settings.',
      domainInfo: `Failed to send to domain: ${recipientEmail.split('@')[1]}`
    }
  }
}

export const validateEmailProvider = async ({ email }) => {
  try {
    console.log('🔍 Validating email provider for:', email)
    
    const provider = getEmailProvider(email)
    const domain = email.split('@')[1]?.toLowerCase()
    
    const providerInfo = {
      outlook: {
        name: 'Microsoft Outlook/Hotmail/Live',
        notes: 'May require checking spam folder. Add sender to safe contacts.',
        deliveryTips: 'Check spam folder, add to safe senders, may take 2-5 minutes'
      },
      gmail: {
        name: 'Google Gmail',
        notes: 'Usually reliable delivery. Check promotions tab.',
        deliveryTips: 'Check promotions tab and spam folder'
      },
      yahoo: {
        name: 'Yahoo Mail',
        notes: 'Good delivery rates. Check spam folder if not received.',
        deliveryTips: 'Check spam folder, add to safe senders'
      },
      '2creative': {
        name: '2Creative Company Email',
        notes: 'Internal company domain. Should have reliable delivery if configured properly.',
        deliveryTips: 'Contact IT admin if not received, check company spam policies'
      },
      educational: {
        name: 'Educational Institution',
        notes: 'Educational domains often have strict email security policies.',
        deliveryTips: 'Check spam folder, contact IT support for sender whitelisting'
      },
      government: {
        name: 'Government Domain',
        notes: 'Government domains have very strict security and filtering policies.',
        deliveryTips: 'Contact IT security team, may require formal sender authorization'
      },
      'custom-domain': {
        name: 'Custom Business Domain',
        notes: 'Custom business domain with unknown email configuration.',
        deliveryTips: 'Check spam folder, contact domain admin, may need sender authentication setup'
      },
      other: {
        name: 'Other Email Provider',
        notes: 'Email compatibility may vary by provider.',
        deliveryTips: 'Check spam folder, add to safe senders'
      }
    }
    
    const info = providerInfo[provider]
    
    return {
      success: true,
      message: `Email provider: ${info.name}. ${info.notes}`,
      provider,
      timestamp: new Date(),
      deliveryTips: info.deliveryTips,
      domainInfo: `Domain: ${domain} (${info.name})`,
      error: null
    }
  } catch (error) {
    console.error('❌ Email provider validation failed:', error)
    return {
      success: false,
      error: error.message,
      provider: 'unknown',
      timestamp: new Date(),
      deliveryTips: 'Unable to validate email provider',
      domainInfo: 'Unknown domain'
    }
  }
}
