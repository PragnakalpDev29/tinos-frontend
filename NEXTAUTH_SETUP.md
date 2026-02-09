# NextAuth Login Implementation Guide

## Overview
This application now has a complete NextAuth-based authentication system with two-step verification (password + OTP) based on the Eclips implementation.

## Features Implemented

### 1. Two-Step Authentication
- **Step 1**: Email/Password validation
- **Step 2**: OTP verification using authenticator apps (Google Authenticator, etc.)

### 2. Session Management
- JWT-based sessions with 24-hour expiration
- Automatic token refresh on 401 errors
- Secure session storage

### 3. Route Protection
- Middleware-based authentication
- Role-based access control
- Public/private route separation

### 4. API Integration
- Axios instance with automatic token injection
- Request/response interceptors
- Failed request queue during token refresh

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           ├── authOptions.ts    # NextAuth configuration
│   │           └── route.ts          # API route handler
│   └── layout.tsx                    # Updated with providers
├── components/
│   ├── features/
│   │   └── auth/
│   │       ├── login-form.tsx        # Main export
│   │       ├── two-step-login.tsx    # Container component
│   │       ├── password-login-form.tsx
│   │       └── otp-verification-form.tsx
│   └── providers/
│       ├── session-provider.tsx
│       └── toast-provider.tsx
├── lib/
│   ├── api/
│   │   ├── axios-instance.ts         # Base axios instance
│   │   └── axios-auth.ts             # Authenticated axios with interceptors
│   ├── constants/
│   │   └── roles.ts                  # Role-based access config
│   └── utils/
│       └── auth-helpers.ts           # Helper functions
├── types/
│   └── next-auth.d.ts                # NextAuth type extensions
├── validators/
│   ├── auth.ts                       # Updated with OTP schema
│   └── common.ts                     # Reusable schemas
└── middleware.ts                     # Route protection

```

## Environment Variables Required

Add these to your `.env.local` file:

```env
# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Backend API
NEXT_PUBLIC_BACKEND_API=https://your-backend-api.com

# OAuth Providers (Optional)
GOOGLE_ID=your-google-client-id
GOOGLE_SECRET=your-google-client-secret
```

## Backend API Endpoints Expected

Your backend should implement these endpoints:

1. **POST /api/auth/token/refresh/** - Email/password authentication
   - Request: `{ email, password }`
   - Response: User data with access/refresh tokens

2. **POST /api/v1/authenticate/** - Initial authentication
   - Request: `{ email, password }`
   - Response: `{ user_id, term_status }`

3. **POST /api/v1/otp-verification/** - OTP verification
   - Request: `{ user_id, otp, accepted_terms_version_id? }`
   - Response: User session data

4. **POST /api/v1/refresh/** - Token refresh
   - Request: `{ refresh }`
   - Response: `{ access }`

5. **GET /api/v1/terms/current/** - Get current terms version (optional)

## Usage

### Login Flow

1. User navigates to `/login`
2. Enters email and password
3. Backend validates credentials and returns `user_id`
4. User enters 6-digit OTP from authenticator app
5. Backend verifies OTP and creates session
6. User redirected to `/dashboard`

### Protected Routes

Routes are protected by middleware. Configure access in `src/lib/constants/roles.ts`:

```typescript
export const PageAccessConfig = {
  admin: ['/dashboard', '/dashboard/users', ...],
  doctor: ['/dashboard', '/dashboard/patients', ...],
  patient: ['/dashboard', '/dashboard/appointments', ...],
}
```

### Using Authenticated Axios

```typescript
'use client'

import useAxiosAuth from '@/lib/api/axios-auth'

export function MyComponent() {
  const { axiosAuth, fetcher } = useAxiosAuth()
  
  // Use axiosAuth for requests
  const fetchData = async () => {
    const response = await axiosAuth.get('/api/v1/data')
    return response.data
  }
  
  // Or use fetcher with SWR
  const { data } = useSWR('/api/v1/data', fetcher)
}
```

### Accessing Session

```typescript
'use client'

import { useSession } from 'next-auth/react'

export function MyComponent() {
  const { data: session, status } = useSession()
  
  if (status === 'loading') return <div>Loading...</div>
  if (status === 'unauthenticated') return <div>Not logged in</div>
  
  return <div>Welcome {session?.user?.full_name}</div>
}
```

## Security Features

1. **JWT Strategy**: Tokens stored in HTTP-only cookies
2. **CSRF Protection**: Built into NextAuth
3. **Password Validation**: Strong password requirements enforced
4. **2FA**: Mandatory OTP verification
5. **Token Refresh**: Automatic with request queuing
6. **Role-Based Access**: Middleware checks user permissions
7. **Error Handling**: Centralized with user-friendly messages

## Testing the Implementation

1. Start your backend API
2. Run the Next.js app: `npm run dev`
3. Navigate to `http://localhost:3000/login`
4. Test the two-step login flow
5. Verify protected routes redirect to login
6. Test token refresh by waiting for expiration

## Customization

### Adding New Roles

Edit `src/lib/constants/roles.ts`:

```typescript
export const PageAccessConfig = {
  new_role: ['/dashboard', '/custom-route'],
}
```

### Adding OAuth Providers

Edit `src/app/api/auth/[...nextauth]/authOptions.ts` and add providers from NextAuth.

### Customizing Login UI

Edit components in `src/components/features/auth/` to match your design system.

## Troubleshooting

### "Invalid credentials" error
- Check backend API URL in `.env.local`
- Verify backend endpoint is `/api/auth/token/refresh/`

### OTP verification fails
- Ensure backend expects `{ user_id, otp }` format
- Check authenticator app is synced

### Session not persisting
- Verify `NEXTAUTH_SECRET` is set
- Check cookies are enabled in browser

### 401 errors on API calls
- Ensure `useAxiosAuth` hook is used in client components
- Verify token refresh endpoint works

## Next Steps

1. Add forgot password flow
2. Implement email verification
3. Add social login (Google, etc.)
4. Create user profile management
5. Add session timeout warnings
