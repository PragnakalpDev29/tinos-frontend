import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    accessToken?: string
    user: {
      id: string
      email: string
      name: string
      date_joined: string
      is_active: boolean
      access: string
      refresh: string
    }
  }
}
