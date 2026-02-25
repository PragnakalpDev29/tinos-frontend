import { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import axios from 'axios'

const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'email@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          // Use server-side URL, bypassing the proxy
          const BASE_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000'

          const response = await axios.post(
            `${BASE_URL}/api/auth/login/`,
            {
              email: credentials?.email,
              password: credentials?.password,
            },
            {
              headers: { 'Content-Type': 'application/json' },
            }
          )
          console.log('Login API Response:', {
            status: response.status,
            endpoint: `${BASE_URL}/api/auth/login/`,
          })

          // Django backend returns: { message, user, tokens: { access, refresh } }
          if (response.data?.tokens && response.data?.user) {
            const userData = {
              ...response.data.user,
              access: response.data.tokens.access,
              refresh: response.data.tokens.refresh,
            }

            // Ensure role is included in the user data
            if (!userData.role) {
              console.warn('Warning: User role not found in backend response')
            }

            return userData
          }

          return response.data
        } catch (error: any) {
          console.error('Login API Error:', error.response?.data || error.message)
          throw new Error(error.response?.data?.error || 'Invalid credentials')
        }
      },
    }),
    // OTP PROVIDER - COMMENTED OUT FOR FUTURE USE
    // Uncomment this when you want to enable two-factor authentication
    /*
    CredentialsProvider({
      id: 'otp',
      name: 'OTP',
      credentials: {
        otp: { label: 'OTP', type: 'text', placeholder: '123456' },
        userId: { label: 'User ID', type: 'text' },
      },
      async authorize(credentials) {
        try {
          const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API
          const response = await axios.post(
            `${BASE_URL}/api/v1/otp-verification/`,
            { otp: credentials?.otp, user_id: credentials?.userId },
            {
              headers: { 'Content-Type': 'application/json' },
            }
          )
          console.log('OTP Verification Response:', {
            status: response.status,
            endpoint: `${BASE_URL}/api/v1/otp-verification/`,
          })
          return response.data
        } catch (error: any) {
          console.error('OTP Verification Error:', error.response?.data || error.message)
          return null
        }
      },
    }),
    */
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || '',
      clientSecret: process.env.GOOGLE_SECRET || '',
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async session({ session, token }) {
      session = token as any
      return session
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === 'update') {
        token.user = session.user
        return token
      }
      return { ...token, ...user }
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default authOptions
