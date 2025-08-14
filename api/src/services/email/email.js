import { sendTestEmail } from 'src/lib/emailService'

export const testEmail = async ({ email }) => {
  try {
    const result = await sendTestEmail(email)
    return result
  } catch (error) {
    console.error('Email test service error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
