export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  email: string
  name: string
  password: string
  password_confirm: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface User {
  id: string
  email: string
  name: string
  date_joined: string
  is_active: boolean
}

export interface AuthResponse {
  message: string
  user: User
  tokens: AuthTokens
}

export interface LoginResponse {
  message: string
  user: User
  tokens: AuthTokens
}

export interface RegisterResponse {
  message: string
  user: User
  tokens: AuthTokens
}

export interface LogoutRequest {
  refresh: string
}

export interface LogoutResponse {
  message: string
}

export interface ProfileResponse {
  user: User
}

export interface ProfileUpdateDto {
  name?: string
}

export interface ProfileUpdateResponse {
  message: string
  user: User
}

export interface ChangePasswordDto {
  current_password: string
  new_password: string
  new_password_confirm: string
}

export interface ChangePasswordResponse {
  message: string
}

export interface RefreshTokenRequest {
  refresh: string
}

export interface RefreshTokenResponse {
  access: string
  refresh: string
}
