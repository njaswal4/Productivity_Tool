import { useMicrosoftAuth, MicrosoftAuthProvider } from 'src/components/MicrosoftAuthProvider/MicrosoftAuthProvider'

// Export your provider and hook directly
export const AuthProvider = MicrosoftAuthProvider
export { useMicrosoftAuth as useAuth }
