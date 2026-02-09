# API Integration Documentation

## Backend API Structure

The Django backend provides authentication endpoints under `/api/auth/` prefix.

### Base URL
- Development: `http://localhost:8001`
- Configure via: `NEXT_PUBLIC_BACKEND_API` environment variable

## Authentication Endpoints

### 1. Register
**POST** `/api/auth/register/`

**Request:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securepassword123",
  "password_confirm": "securepassword123"
}
```

**Response (201):**
```json
{
  "message": "Registration successful.",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "date_joined": "2024-01-01T00:00:00Z",
    "is_active": true
  },
  "tokens": {
    "access": "jwt_access_token",
    "refresh": "jwt_refresh_token"
  }
}
```

**Error Response (400):**
```json
{
  "error": "email: A user with this email already exists."
}
```

### 2. Login
**POST** `/api/auth/login/`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful.",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "date_joined": "2024-01-01T00:00:00Z",
    "is_active": true
  },
  "tokens": {
    "access": "jwt_access_token",
    "refresh": "jwt_refresh_token"
  }
}
```

**Error Response (401):**
```json
{
  "error": "Invalid email or password."
}
```

### 3. Logout
**POST** `/api/auth/logout/`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "refresh": "jwt_refresh_token"
}
```

**Response (200):**
```json
{
  "message": "Logout successful."
}
```

**Error Response (400):**
```json
{
  "error": "Invalid or expired token."
}
```

### 4. Get Profile
**GET** `/api/auth/profile/`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "date_joined": "2024-01-01T00:00:00Z",
  "is_active": true
}
```

### 5. Update Profile
**PUT** `/api/auth/profile/`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "name": "Jane Doe"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully.",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Jane Doe",
    "date_joined": "2024-01-01T00:00:00Z",
    "is_active": true
  }
}
```

### 6. Change Password
**POST** `/api/auth/change-password/`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "current_password": "oldpassword123",
  "new_password": "newpassword123",
  "new_password_confirm": "newpassword123"
}
```

**Response (200):**
```json
{
  "message": "Password changed successfully."
}
```

**Error Response (400):**
```json
{
  "error": "Current password is incorrect."
}
```

### 7. Refresh Token
**POST** `/api/auth/token/refresh/`

**Request:**
```json
{
  "refresh": "jwt_refresh_token"
}
```

**Response (200):**
```json
{
  "access": "new_jwt_access_token",
  "refresh": "new_jwt_refresh_token"
}
```

## Frontend Implementation

### Service Layer
Location: `src/lib/services/auth.service.ts`

**Available Methods:**
- `authService.register(data: RegisterDto)` - Register new user
- `authService.login(credentials: LoginDto)` - Login user
- `authService.logout()` - Logout user
- `authService.getProfile()` - Get current user profile
- `authService.updateProfile(data: ProfileUpdateDto)` - Update profile
- `authService.changePassword(data: ChangePasswordDto)` - Change password
- `authService.refreshToken()` - Refresh access token

### API Client
Location: `src/lib/api/client.ts`

**Features:**
- Automatic JWT token attachment to requests
- Automatic token refresh on 401 errors
- Token storage in localStorage
- Request/response interceptors

### Type Definitions
Location: `src/types/auth.ts`

All TypeScript interfaces for requests and responses are defined here.

### Endpoints Configuration
Location: `src/lib/api/endpoints.ts`

Centralized endpoint definitions matching Django backend routes.

## Token Management

### Storage
- Access Token: `localStorage.getItem('accessToken')`
- Refresh Token: `localStorage.getItem('refreshToken')`

### Automatic Refresh
The API client automatically:
1. Attaches access token to all requests
2. Intercepts 401 responses
3. Attempts to refresh the token
4. Retries the original request with new token
5. Clears tokens on refresh failure

## Usage Examples

### Register a User
```typescript
import { authService } from '@/lib/services/auth.service'

const handleRegister = async () => {
  try {
    const response = await authService.register({
      email: 'user@example.com',
      name: 'John Doe',
      password: 'password123',
      password_confirm: 'password123'
    })
    console.log('User registered:', response.user)
    // Tokens are automatically stored
  } catch (error) {
    console.error('Registration failed:', error)
  }
}
```

### Login
```typescript
import { authService } from '@/lib/services/auth.service'

const handleLogin = async () => {
  try {
    const response = await authService.login({
      email: 'user@example.com',
      password: 'password123'
    })
    console.log('Login successful:', response.user)
    // Tokens are automatically stored
  } catch (error) {
    console.error('Login failed:', error)
  }
}
```

### Get Profile
```typescript
import { authService } from '@/lib/services/auth.service'

const getProfile = async () => {
  try {
    const user = await authService.getProfile()
    console.log('User profile:', user)
  } catch (error) {
    console.error('Failed to get profile:', error)
  }
}
```

### Logout
```typescript
import { authService } from '@/lib/services/auth.service'

const handleLogout = async () => {
  try {
    await authService.logout()
    // Tokens are automatically cleared
    // Redirect to login page
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
```

## Error Handling

The backend returns errors in the following format:
```json
{
  "error": "Descriptive error message"
}
```

Frontend should handle these errors appropriately and display user-friendly messages.

## Environment Variables

Add to `.env.local`:
```
NEXT_PUBLIC_BACKEND_API=http://localhost:8001
```

For production, update to your production backend URL.
