# Frontend API Integration Changes Summary

## Overview
Updated the Next.js frontend to integrate with the Django backend authentication API. All authentication endpoints, types, and services now match the backend structure.

## Files Modified

### 1. `src/lib/api/endpoints.ts`
**Changes:**
- Updated all auth endpoints to match Django backend routes
- Changed from `/auth/token` to `/api/auth/login/`
- Changed from `/auth/register` to `/api/auth/register/`
- Changed from `/auth/logout` to `/api/auth/logout/`
- Added `/api/auth/profile/` for user profile
- Added `/api/auth/change-password/` for password changes
- Changed from `/auth/refresh` to `/api/auth/token/refresh/`
- Removed deprecated endpoints (OTP_VERIFY, AUTHENTICATE, ME, TERMS_CURRENT)

### 2. `src/types/auth.ts`
**Changes:**
- Simplified `RegisterDto` to match Django serializer (removed firstName, lastName, phone, agreeToTerms)
- Added `name` and `password_confirm` fields
- Updated `User` interface to match Django User model (id, email, name, date_joined, is_active)
- Removed complex nested objects (role, organization)
- Added new response types: `LoginResponse`, `RegisterResponse`, `LogoutResponse`, `ProfileUpdateResponse`, `ChangePasswordResponse`, `RefreshTokenResponse`
- Added request types: `LogoutRequest`, `ProfileUpdateDto`, `ChangePasswordDto`, `RefreshTokenRequest`

### 3. `src/lib/api/client.ts`
**Changes:**
- Updated base URL to use `NEXT_PUBLIC_BACKEND_API` environment variable
- Added request interceptor to automatically attach JWT access token from localStorage
- Added response interceptor to handle 401 errors and automatic token refresh
- Implements token refresh flow on authentication failures

### 4. `src/lib/services/auth.service.ts`
**Complete Rewrite:**
- `register()` - Now sends data in Django-expected format, stores both access and refresh tokens
- `login()` - Updated to handle Django response structure with nested tokens object
- `logout()` - Now sends refresh token in request body as required by Django
- `getProfile()` - New method to get user profile (GET /api/auth/profile/)
- `updateProfile()` - New method to update user profile (PUT /api/auth/profile/)
- `changePassword()` - New method to change password (POST /api/auth/change-password/)
- `refreshToken()` - Updated to use correct endpoint and request format
- Removed deprecated methods: `authenticate()`, `getCurrentUser()`, `verifyOTP()`

### 5. `src/lib/api/axios-auth.ts`
**Changes:**
- Updated token refresh endpoint from `/api/v1/refresh/` to `/api/auth/token/refresh/`

## Files Created

### 1. `API_INTEGRATION.md`
Comprehensive documentation covering:
- All backend API endpoints with request/response examples
- Frontend implementation details
- Service layer usage examples
- Token management explanation
- Error handling guidelines
- Environment variable configuration

### 2. `CHANGES_SUMMARY.md` (this file)
Summary of all changes made to the frontend codebase.

## Backend API Structure

### Base URL
- `http://localhost:8001` (configurable via `NEXT_PUBLIC_BACKEND_API`)

### Endpoints
1. **POST** `/api/auth/register/` - Register new user
2. **POST** `/api/auth/login/` - Login user
3. **POST** `/api/auth/logout/` - Logout user (requires auth)
4. **GET** `/api/auth/profile/` - Get user profile (requires auth)
5. **PUT** `/api/auth/profile/` - Update user profile (requires auth)
6. **POST** `/api/auth/change-password/` - Change password (requires auth)
7. **POST** `/api/auth/token/refresh/` - Refresh access token

## Token Management

### Storage
- Access Token: Stored in `localStorage` as `accessToken`
- Refresh Token: Stored in `localStorage` as `refreshToken`

### Automatic Handling
- All authenticated requests automatically include `Authorization: Bearer <token>` header
- 401 responses trigger automatic token refresh
- Failed refresh attempts clear tokens and require re-login

## Breaking Changes

### RegisterDto Interface
**Before:**
```typescript
{
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  agreeToTerms: boolean
}
```

**After:**
```typescript
{
  email: string
  name: string
  password: string
  password_confirm: string
}
```

### User Interface
**Before:**
```typescript
{
  id: string
  first_name: string
  last_name: string
  full_name: string
  email: string
  role: { id, name, display_name, type }
  organization: { id, name }
  // ... other fields
}
```

**After:**
```typescript
{
  id: string
  email: string
  name: string
  date_joined: string
  is_active: boolean
}
```

### Auth Response Structure
**Before:**
```typescript
{
  access: string
  refresh: string
  user_id?: string
}
```

**After:**
```typescript
{
  message: string
  user: User
  tokens: {
    access: string
    refresh: string
  }
}
```

## Migration Guide

### For Existing Components Using Auth

1. **Update Register Forms:**
   - Change field names from `firstName`/`lastName` to single `name` field
   - Change `confirmPassword` to `password_confirm`
   - Remove `phone` and `agreeToTerms` fields (or handle separately)

2. **Update User Display:**
   - Use `user.name` instead of `user.first_name` or `user.full_name`
   - Remove references to `user.role` and `user.organization`

3. **Update Auth Response Handling:**
   - Access tokens via `response.tokens.access` instead of `response.access`
   - Access user data via `response.user` instead of separate calls

4. **Update Logout:**
   - No changes needed - service handles refresh token automatically

## Testing Checklist

- [ ] Test user registration with new field structure
- [ ] Test user login
- [ ] Test logout functionality
- [ ] Test profile retrieval
- [ ] Test profile update
- [ ] Test password change
- [ ] Test automatic token refresh on 401 errors
- [ ] Test token persistence across page refreshes
- [ ] Verify error messages display correctly

## Environment Configuration

Ensure `.env` or `.env.local` contains:
```
NEXT_PUBLIC_BACKEND_API=http://localhost:8001
```

For production, update to production backend URL.

## Next Steps

1. Update any existing authentication forms to use new field structure
2. Update user profile components to use new User interface
3. Test all authentication flows end-to-end
4. Update any middleware or route guards if needed
5. Consider adding error boundary components for API errors
