import { api } from './client'
import type { LoginResponse, User } from '../types/api'

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/login', { email, password })

  return data
}

export async function logout(): Promise<void> {
  await api.post('/logout')
}

export async function me(): Promise<User> {
  const { data } = await api.get<{ user: User }>('/me')

  return data.user
}
