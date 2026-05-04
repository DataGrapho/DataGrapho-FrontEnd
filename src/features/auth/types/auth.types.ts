export type LoginPayload = {
  email: string
  password: string
}

export type RequestPasswordResetPayload = {
  email: string
}

export type ResetPasswordPayload = {
  password: string
  confirmPassword: string
  token?: string
}

export type LoginResponse = {
  accessToken?: string
  refreshToken?: string
  user?: {
    id: string
    name?: string
    email?: string
  }
}
